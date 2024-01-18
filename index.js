import path from "path"
import * as url from "url"
const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
import Origin from "./lib/Origin.js"
import Fragment from "./lib/Fragment.js"

/*
options[Object]
 - url[String]: 转换m3u8文件的url
 - input[String]: 转换的m3u8本地文件
 - path[String]: 转换后的保存路径
 - name[String]: 转换后的文件名(包含后缀)
 - clear[Boolean]: 是否只执行清楚缓存
 - tempDir[String]: ts片的临时保存路径, 默认为path.resolve(__dirname, '.temp'),
 - encodeSuffix[String]: 未解密的ts片后缀, 默认为.encode
 - decodeSuffix[String]: 已解密或者无需解密的ts片后缀, 默认为.ts

parsered(fragments)
 - fragments[Array]: 解析后的所有片段信息

downloadChange(total, current, fragment)
 - total[Number]: 总数
 - current[Number]: 当前索引
 - fragment[Object]: 当前的ts片段信息
*/
export default async function (options, parsered, downloadChange) {
    if (!options.url && !options.input && !options.clear) {
        return Promise.reject(
            "Options is missing parameter url or input!\n" + "options缺少参数url或者input!"
        )
    }
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
        options.url ? await origin.parserUrl() : await origin.parserFile()
        await origin.addCache()
        parsered(origin.list)

        // download
        const fragment = new Fragment(origin, options)
        await fragment.download(downloadChange)
        const savePath = await fragment.merge()
        return Promise.resolve(savePath)
    } catch (error) {
        return Promise.reject(error)
    }
}
