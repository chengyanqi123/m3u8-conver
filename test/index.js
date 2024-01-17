import mconver from "../index.js"

const parsered = (fragments) => {
    console.log(fragments)
}
const downloadChange = (total, current, fragment) => {
    console.log(`downloading... [${current + 1}/${total}]\r`)
}
const options = {
    url: "https://hls.vdtuzv.com/videos3/689bc9e3ec85d702e25abec391b1a95f/689bc9e3ec85d702e25abec391b1a95f.m3u8?auth_key=1705511755-65a80b4b3aa46-0-28c5cecffc6a600db25a3008c30e208e&v=3&time=0",
    // url: "https://www.test.com",
}

await mconver(options, parsered, downloadChange)
