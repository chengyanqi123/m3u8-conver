import Conver from './lib/conver.js'
import path from "path"
import type { optionsType } from './types/index.js';

export default async function (options?: optionsType) {
    // Default Options
    const cwdPath = process.cwd()
    const conver = new Conver({
        input: "https://hls.vdtuzv.com/videos3/db1b5f653a24cda3b7bc4a52a4d1baed/db1b5f653a24cda3b7bc4a52a4d1baed.m3u8?auth_key=1706038497-65b014e1dcd6d-0-3252ee6923fedb5343b7ed9bf55b74d9&v=3&time=0",
        concurrency: 1,
        path: cwdPath,
        name: new Date().getTime() + ".mp4",
        tempDir: path.resolve(cwdPath, ".temp"),
        encodeSuffix: ".encode",
        decodeSuffix: ".ts",
        clear: false,
        requestOptions: {},
        onchange: (total, current) => {
            console.log(`${current}/${total}`)
        }
    });
    await conver.parser()
    await conver.downloader()
    return await conver.merge()
}