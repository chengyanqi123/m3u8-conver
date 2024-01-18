import path from "path"
import * as url from "url"
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
import Origin from "./lib/Origin.js"
import Fragment from "./lib/Fragment.js"
import { isFunction } from "./utilities.js"

export default async function (options, callbacks = {}) {
    if (!options.url && !options.input && !options.clear) {
        return Promise.reject(
            "Options is missing parameter url or input!\n" + "options缺少参数url或者input!"
        )
    }
    const { parsered, downloadChange, parserHandler } = callbacks
    const defaultOptions = {
        path: path.resolve("./"),
        name: new Date().getTime() + ".mp4",
        tempDir: path.resolve(__dirname, ".temp"),
        encodeSuffix: ".encode",
        decodeSuffix: ".ts",
    }
    options = Object.assign({}, options, defaultOptions)
    try {
        // parser
        const origin = new Origin(options)
        options.url ? await origin.parserUrl(parserHandler) : await origin.parserFile(parserHandler)
        origin.addCache()
        isFunction(parsered) && parsered(origin.list)

        // download
        const fragment = new Fragment(origin, options)
        await fragment.download(downloadChange)
        const savePath = await fragment.merge()
        return Promise.resolve(savePath)
    } catch (error) {
        return Promise.reject(error)
    }
}
