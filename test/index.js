import mconver from "../index.js"
import got from "got"

const options = {
    url: "https://www.test.com",
    // input: "1.m3u8",
    name: "output.avi",
    requestOptions: {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "x-private-key":
                "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRrcr11xxi5Vu9E09fRL14Ae9W4pExFx",
            Cookie: "intercom-session-dgkjq2bp=ZVh3S25SL1pOQTBHU3pKMnlMZHhFYWR6OTRJK1d6ZUg5cWdMdGpWMnoxYmZOOHNTbHRkMi9lUDM4N2l1RUNXRS0tVC9xUkdIOFRHQnhTT1RFaTFUVUtvdz09--b11b4314e510c38d73634d8b8d92a929c32568b2; _dd_s=rum=0&expire=1705594320987",
        },
    },
}

async function parserHandler(fragment, index) {
    // fragment ts uri has portcol?
    // if not, use resolve merge `options.url`(m3u8 file url)
    fragment.uri = fragment.uri.startsWith("http")
        ? fragment.uri
        : url.resolve(this.options.url /* options.url  */, fragment.uri)

    // if fragment not key, this not's encryption
    // No parsing required
    const key = Object.assign({}, fragment.key)
    if (!key || Object.keys(key).length === 0) {
        return fragment
    }

    // Next all encryption is true
    fragment.encryption = true
    // The standard encryption method is `AES-128-CBD`
    key.method = (key.method + "-cbc").toUpperCase()
    // ts key uri has portcol?
    key.uri = key.uri.startsWith("http") ? key.uri : url.resolve(fragment.uri, key.uri)
    // get key data(key.key) by key.uri
    // If you have a key cache
    // use it directly to avoid repeated acquisition and unnecessary network time
    if (this.keyCache[key.uri]) {
        key.key = this.keyCache[key.uri]
    } else {
        const keyResponse = await got(key.uri, { responseType: "buffer" })
        key.key = keyResponse.body.buffer
        this.keyCache[key.uri] = key.key
    }

    // Reset the parsed key information
    fragment.key = key

    // Return fragment. This is a must
    return fragment
}

await mconver(options, {
    parsered(fragments) {
        console.log("parsered")
        // It only needs parsing, no downloading, just send an exception after the parsing is completed!
        // 只需要解析, 不需要下载, 在解析完成后抛出异常即可!
        // throw new Error("parsered")
    },
    downloadChange(total, current, fragment) {
        console.log(`downloading... [${current + 1}/${total}]\r`)
    },
    parserHandler,
})
