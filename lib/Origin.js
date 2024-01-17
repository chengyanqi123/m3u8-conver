import fs from "fs"
import url from "url"
import path from "path"
import got from "got"
import { Parser } from "m3u8-parser"
import { createMd5, zeroPad, isFunction } from "../utilities.js"

export default class Origin {
    constructor(options) {
        this.options = options
        this.content = ""
        this.dirHash = ""
        this.tempPath = ""
        this.list = []
        this.cache = {}
    }

    async parserUrl() {
        const response = await got(this.options.url)
        this.content = response.body
        this.parser()
    }
    async parserFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.options.input, "utf8", (err, data) => {
                if (err) {
                    reject(err)
                }
                this.content = data
                this.parser()
                resolve()
            })
        })
    }

    async parser() {
        // parse m3u8 text to json
        const parser = new Parser()
        parser.push(this.content)
        parser.end()
        let list = parser.manifest.segments
        this.dirHash = createMd5(this.content)
        this.tempPath = path.resolve(this.options.tempDir, this.dirHash)

        for (let i = 0; i < list.length; i++) {
            let fragment = list[i]

            // add download options
            //  - padIndex: file padIndex name.
            //  - en/decodePath: en/decode save path.
            //  - keyURL: key download url.
            const padIndex = zeroPad(i, 7)
            const downloadOptions = {
                padIndex,
                encodePath: path.resolve(this.tempPath, padIndex + this.options.encodeSuffix),
                decodePath: path.resolve(this.tempPath, padIndex + this.options.decodeSuffix),
                encryption: false,
            }

            // if use file model, and uri not protcol
            if (this.options.input && !item.uri.startsWith("http")) {
                throw new Error(
                    "The download link is missing the host, please try using url mode!\n" +
                        "下载链接缺少host, 请使用url模式尝试!"
                )
            }

            // fragment uri has portcol?
            fragment.uri = fragment.uri.startsWith("http")
                ? fragment.uri
                : url.resolve(this.options.url, fragment.uri)

            // if fragment has key, this is encryption
            const key = Object.assign({}, fragment.key)
            if (key && Object.keys(key).length !== 0) {
                downloadOptions.encryption = true
                key.method = (key.method + "-cbc").toUpperCase()
                key.uri = key.uri.startsWith("http")
                    ? key.uri
                    : url.resolve(this.options.url, key.uri)
                fragment.key = key
            }

            this.list.push({
                ...fragment,
                ...downloadOptions,
            })
        }
        list = null
    }

    async addCache() {
        for (let index = 0; index < this.list.length; index++) {
            const item = this.list[index]

            // not encryption
            if (!item.encryption) {
                continue
            }

            // not decode cache, added it
            const md5 = createMd5(JSON.stringify(item.key))
            if (!this.cache[md5]) {
                const key = Object.assign({}, item.key)
                const keyResponse = await got(key.uri, { responseType: "buffer" })
                key.key = keyResponse.body.buffer

                // Missing parameters key or iv
                if (!(key.key && key.iv)) {
                    throw new Error("Missing parameters key or iv!\n" + "缺少key或iv参数!")
                }

                const cache = {
                    method: key.method,
                    uri: key.uri,
                    iv: key.iv,
                    key: key.key,
                }
                item.key = key
                this.cache[md5] = cache
            }
            this.list[index] = {
                ...item,
                md5: md5,
            }
        }
    }
}
