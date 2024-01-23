import type { optionsType, FragmentType, parserModel, cacheType } from "../@types/types.js"
import validate from "./validate.js"
// Origin
import fs from "fs"
import url from "url"
import path from "path"
import { Parser } from "m3u8-parser"
import { createMd5, zeroPad, detectAesMode, isWebLink, isDirectory, checkDirectory } from "../utilities.js"
import got from "got"
// Fragment
import { rm } from "fs/promises"
import { pipeline as streamPipeline } from "node:stream/promises"
import crypto from "crypto"
import PQueue from "p-queue"
import { exec } from "child_process"
import fins from "@ffmpeg-installer/ffmpeg"
const ffmpegPath = fins.path

class Conver {
    private content: string = ""
    private cache: cacheType = new Map()
    private currentIndex: number = 0
    private hash: string = ""
    private tempPath: string = ""
    private model: parserModel = "Local"
    fragments: Array<FragmentType> = []

    constructor(public options: optionsType) {
        this.options = validate(options)
    }
    private async _download(url: string, path: string) {
        return streamPipeline(got.stream(url, this.options.requestOptions), fs.createWriteStream(path))
    }
    private async _decode(fragment: FragmentType) {
        const { encodePath, decodePath } = fragment
        const { key, iv, method } = fragment.key
        if (key && iv) {
            await streamPipeline(
                fs.createReadStream(encodePath),
                crypto.createDecipheriv(method, key, iv),
                fs.createWriteStream(decodePath)
            )
        }
        await rm(encodePath, { recursive: true, force: true })
    }
    private async _parserHandler(fragment: FragmentType): Promise<FragmentType> {
        const uriIsWebLink = isWebLink(fragment.uri)
        if (this.model === 'Local' && !uriIsWebLink) {
            throw new Error(
                "The download link is missing the host, please try using url mode!"
            )
        }

        // fragment uri has portcol?
        fragment.uri = uriIsWebLink ? fragment.uri : url.resolve(this.options.input, fragment.uri)

        // if fragment not key, this not's encryption
        const key = Object.assign({}, fragment.key)
        if (!key || Object.keys(key).length === 0) {
            return fragment
        }

        if (!key.uri || !key.iv) {
            throw new Error("The fragment encryption key or iv is missing the download link!")
        }

        // next all encryption is true
        key.uri = isWebLink(key.uri) ? key.uri : url.resolve(fragment.uri, key.uri)
        if (this.cache.get(key.uri)) {
            // Using the key to identify the real encryption mode
            // be confined to AES-128-CBC | AES-192-CBC | AES-256-CBC, default AES-128-CBC
            key.key = this.cache.get(key.uri)
        } else {
            const keyResponse = await got(key.uri, { ...this.options.requestOptions, responseType: "buffer" })
            this.cache.set(key.uri, keyResponse.body.buffer)
            key.key = keyResponse.body.buffer
        }

        if (key.key) {
            key.method = detectAesMode(key.key)
        } else {
            key.method = "AES-128-CBC"
        }

        // reset fragment.key
        fragment.key = key
        return fragment
    }
    async parser() {
        // get m3u8 content
        this.model = isWebLink(this.options.input) ? 'Cloud' : 'Local'
        try {
            if (this.model === 'Cloud') {
                const response = await got(this.options.input)
                this.content = response.body
            } else {
                if (isDirectory(this.options.input)) {
                    throw new Error("input not is file path!")
                }
            }
        } catch (error) {
            throw error
        }

        // m3u8 content to json
        const parser = new Parser()
        parser.push(this.content)
        parser.end()
        let list = parser.manifest.segments
        this.hash = createMd5(this.content)
        this.tempPath = path.resolve(this.options.tempDir, this.hash)
        const handler = this.options.parser?.bind(this) || this._parserHandler.bind(this)
        // parse m3u8 data for fragment
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const padIndex = zeroPad(i, 7)
            const fragmentDownloadOptions = {
                padIndex,
                encodePath: path.resolve(this.tempPath, padIndex + this.options.encodeSuffix),
                decodePath: path.resolve(this.tempPath, padIndex + this.options.decodeSuffix),
            }
            const fragment = await handler(item, i)
            this.fragments.push({
                ...fragmentDownloadOptions,
                ...fragment
            })
        }
    }
    async downloader() {
        this.currentIndex = checkDirectory(this.tempPath, this.options.decodeSuffix)
        const leng = this.fragments.length
        const queue = new PQueue({ concurrency: this.options.concurrency || 1, autoStart: false })
        let completedCount = this.currentIndex
        console.log('this.currentIndex', this.currentIndex, 'leng', leng);


        for (let i = this.currentIndex; i < leng; i++) {
            const fragment = this.fragments[i]
            const { uri, encodePath, decodePath, key } = fragment
            // Prevent duplicate downloads
            if (fs.existsSync(decodePath)) {
                completedCount++
                continue
            }

            queue.add(async () => {
                const path = key ? encodePath : decodePath
                await this._download(uri, path)
                completedCount++
                this.options.onchange && this.options.onchange(leng, completedCount, fragment)
                if (key) await this._decode(fragment)
            })
        }
        await queue.start().onIdle()
    }
    merge() {
        return new Promise((resolve, reject) => {
            const fileList = []
            let files = fs.readdirSync(this.tempPath)
            for (let i = 0; i < files.length; i++) {
                const filename = files[i]
                if (!filename.endsWith(this.options.decodeSuffix)) {
                    continue
                }
                fileList.push(path.resolve(this.tempPath, filename))
            }
            const mergeListTextFile = fileList.map((path) => `file '${path}'`).join("\n")
            const mergeListTextFilePath = path.resolve(this.tempPath, "mergeList.txt")

            fs.writeFileSync(mergeListTextFilePath, mergeListTextFile)
            const outputFilePath = path.resolve(this.options.path, this.options.name)

            // Two merge commands, choose one
            const ffmpegCommand =
                // `${ffmpegPath} -i "concat:${fileList.join('|')}" -c copy "${outputFilePath}"` ||
                `${ffmpegPath} -y -f concat -safe 0 -i ${mergeListTextFilePath} -c copy ${outputFilePath}`

            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    return reject(`fragments merge error: ${error}`)
                }
                fs.rmSync(this.tempPath, { recursive: true, force: true })
                resolve(outputFilePath)
            })
        })
    }
}

export default Conver