import fs from "fs"
import { pipeline as streamPipeline } from "node:stream/promises"
import path from "path"
import got from "got"
import crypto from "crypto"
import { findArithmeticProgressionMax } from "../utilities.js"
import { exec } from "child_process"
// ffmpeg
import ffins from "@ffmpeg-installer/ffmpeg"
const ffmpegPath = ffins.path

export default class Fragment {
    constructor(origin, options) {
        const { content, dirHash, tempPath, cache, list } = origin
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
            this.index = findArithmeticProgressionMax(numbers)
        } else {
            fs.mkdirSync(this.tempPath, { recursive: true })
        }
    }
    decode(fragment) {
        return new Promise((resolve, reject) => {
            const { encodePath, decodePath, md5 } = fragment

            const { key, iv, method } = this.cache[md5]
            const readStream = fs.createReadStream(encodePath)
            const writeStream = fs.createWriteStream(decodePath)
            const decipher = crypto.createDecipheriv(method, key, iv)
            readStream.pipe(decipher).pipe(writeStream)
            writeStream.on("finish", () => {
                resolve()
            })
            writeStream.on("error", (err) => {
                reject(err)
            })
        })
    }
    async download(onchange) {
        this.checkDirectory()
        const leng = this.fragments.length
        for (let i = this.index; i < leng; i++) {
            const fragment = this.fragments[i]
            const { uri, encodePath, decodePath, encryption } = fragment

            // Prevent duplicate downloads
            if (fs.existsSync(decodePath)) {
                continue
            }
            if (encryption) {
                await streamPipeline(got.stream(uri), fs.createWriteStream(encodePath))
                await this.decode(fragment)
                fs.rmSync(encodePath, { recursive: true, force: true })
            } else {
                await streamPipeline(got.stream(uri), fs.createWriteStream(decodePath))
            }

            onchange(leng, i, fragment)
        }
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
