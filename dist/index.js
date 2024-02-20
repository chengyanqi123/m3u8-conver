import Conver from './lib/conver.js';
import path from "path";
import { isWebLink } from './utilities.js';
// example
async function conver(options) {
    // Default Options
    const cwdPath = process.cwd();
    const defaultOptions = {
        input: "",
        concurrency: 1,
        path: cwdPath,
        name: new Date().getTime() + ".mp4",
        tempDir: path.resolve(cwdPath, ".temp"),
        encodeSuffix: ".encode",
        decodeSuffix: ".ts",
        clear: false,
        requestOptions: {},
    };
    // merge options
    options.input = options?.input || defaultOptions.input;
    options.concurrency = options?.concurrency || defaultOptions.concurrency;
    options.path = options?.path || defaultOptions.path;
    options.name = options?.name || defaultOptions.name;
    options.tempDir = options?.tempDir || defaultOptions.tempDir;
    options.encodeSuffix = options?.encodeSuffix || defaultOptions.encodeSuffix;
    options.decodeSuffix = options?.decodeSuffix || defaultOptions.decodeSuffix;
    options.clear = options?.clear || defaultOptions.clear;
    options.requestOptions = options?.requestOptions || defaultOptions.requestOptions;
    options.onchange = options?.onchange || defaultOptions.onchange;
    options.parser = options?.parser || defaultOptions.parser;
    options.parsered = options?.parsered || defaultOptions.parsered;
    options.downloaded = options?.downloaded || defaultOptions.downloaded;
    options.input = isWebLink(options.input) ? options.input : path.resolve(cwdPath, options.input);
    // start main
    const conver = new Conver(Object.assign(defaultOptions, options));
    await conver.parser();
    await conver.downloader();
    return await conver.merge();
}
// example
// await conver({
//     input: "https://www.test.com",
//     concurrency: 10,
//     parsered(fragments) {
//         console.log(fragments.length);
//     },
//     onchange: (total: number, current: number) => {
//         console.log(`${current}/${total}`)
//     }
// })
export default conver;
