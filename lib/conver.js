import path from "path"
import fs from "fs"
import Origin from "./core/Origin.js"
import Fragment from "./core/Fragment.js"
import validate from "./validate.js"
import { fileURLToPath } from "url"
const __dirname = fileURLToPath(new URL(".", import.meta.url))

export default async function (options) {
    const cwdPath = process.cwd()
    const defaultOptions = {
        url: "",
        input: "",
        concurrency: 1,
        path: cwdPath,
        name: new Date().getTime() + ".mp4",
        tempDir: path.resolve(__dirname, "../", ".temp"),
        encodeSuffix: ".encode",
        decodeSuffix: ".ts",
        clear: false,
        requestOptions: {},
    }
    options = Object.assign({}, defaultOptions, options)
    options = validate(options)
    const { parsered, onchange, parser } = options

    try {
        // clear
        if (options.clear) {
            fs.rmSync(options.tempDir, { recursive: true, force: true })
            return Promise.resolve()
        }
        // parser
        const origin = new Origin(options)
        if (options.url) {
            await origin.parserUrl(parser)
        } else {
            await origin.parserFile(parser)
        }
        // cache
        origin.addCache()
        parsered && parsered(origin.list)

        // download
        const fragment = new Fragment(origin, options)
        await fragment.download(onchange)
        const savePath = await fragment.merge()
        return Promise.resolve(savePath)
    } catch (error) {
        return Promise.reject(error)
    }
}
