import fs from "fs"
import { rm } from "fs/promises"
import { pipeline as streamPipeline } from "node:stream/promises"
import path from "path"
import got from "got"
import crypto from "crypto"
import PQueue from "p-queue"
import { findArithmeticProgressionMax } from "../utilities.js"
import { exec } from "child_process"
// ffmpeg
import ffins from "@ffmpeg-installer/ffmpeg"
const ffmpegPath = ffins.path

export default class Fragment {
    constructor(origin) {
        const { content, dirHash, tempPath, cache, list, options } = origin
        this.cache = cache
        this.content = content
        this.dirHash = dirHash
        this.fragments = list
        this.tempPath = tempPath
        this.options = options
        this.index = 0
    }
    checkDirectory() {
        // Check the directory and downloaded fragments
        if (fs.existsSync(this.tempPath)) {
            let files = fs.readdirSync(this.tempPath)
            const numbers = []
            for (let i = 0; i < files.length; i++) {
                const filename = files[i]
                if (!filename.endsWith(this.options.decodeSuffix)) {
                    continue
                }
                const number = parseInt(filename.split(".")[0])
                numbers.push(number)
            }
            const index = findArithmeticProgressionMax(numbers)
            this.index = index ? index - 1 : index
        } else {
            fs.mkdirSync(this.tempPath, { recursive: true })
        }
    }
    async decode(fragment) {
        const { encodePath, decodePath, md5 } = fragment
        const { key, iv, method } = this.cache[md5]
        await streamPipeline(
            fs.createReadStream(encodePath),
            crypto.createDecipheriv(method, key, iv),
            fs.createWriteStream(decodePath)
        )
        await rm(encodePath, { recursive: true, force: true })
    }
    async down(uri, path, requestOptions) {
        return streamPipeline(got.stream(uri, requestOptions), fs.createWriteStream(path))
    }
    async download(onchange) {
        this.checkDirectory()
        const leng = this.fragments.length
        const queue = new PQueue({ concurrency: this.options.concurrency || 1, autoStart: false })
        const requestOptions = Object.assign({}, this.options.requestOptions)
        let completedCount = this.index

        for (let i = this.index; i < leng; i++) {
            const fragment = this.fragments[i]
            const { uri, encodePath, decodePath, encryption } = fragment
            // Prevent duplicate downloads
            if (fs.existsSync(decodePath)) {
                completedCount++
                continue
            }

            queue.add(async () => {
                const path = encryption ? encodePath : decodePath
                await this.down(uri, path, requestOptions)
                completedCount++
                onchange && onchange(leng, completedCount, fragment)
                if (encryption) await this.decode(fragment)
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
