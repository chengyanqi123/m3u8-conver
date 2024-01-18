import mconver from "../index.js"
import got from "got"

const options = {
    url: "https://www.test.com",
    // input: "1.m3u8",
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
    },
    downloadChange(total, current, fragment) {
        console.log(`downloading... [${current + 1}/${total}]\r`)
    },
    parserHandler,
})
