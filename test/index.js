import mconver from "../index.js"
import got from "got"
import { detectAesMode } from "../lib/utilities.js"

await mconver({
    url: "https://www.test.com",
    // input: "input.m3u8",
    name: "pc.mp4",
    clear: false,
    concurrency: 6,
    requestOptions: {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "x-private-key":
                "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRrcr11xxi5Vu9E09fRL14Ae9W4pExFx",
            Cookie: "intercom-session-dgkjq2bp=ZVh3S25SL1pOQTBHU3pKMnlMZHhFYWR6OTRJK1d6ZUg5cWdMdGpWMnoxYmZOOHNTbHRkMi9lUDM4N2l1RUNXRS0tVC9xUkdIOFRHQnhTT1RFaTFUVUtvdz09--b11b4314e510c38d73634d8b8d92a929c32568b2; _dd_s=rum=0&expire=1705594320987",
        },
    },
    onparsered() {
        console.log("parsered")
        // It only needs parsing, no downloading, just send an exception after the parsing is completed!
        // throw new Error("parsered")
    },
    onchange(total, current, fragment) {
        console.log(`downloading... [${current}/${total}]\r`)
    },
    async parser(fragment, index) {
        if (this.options.input /* options.input */ && !fragment.uri.startsWith("http")) {
            throw new Error(
                "The download link is missing the host, please try using url mode!\n" +
                    "下载链接缺少host, 请使用url模式尝试!"
            )
        }

        // fragment uri has portcol?
        fragment.uri = fragment.uri.startsWith("http")
            ? fragment.uri
            : url.resolve(this.options.url /* options.url */, fragment.uri)

        // if fragment not key, this not's encryption
        const key = Object.assign({}, fragment.key)
        if (!key || Object.keys(key).length === 0) {
            return fragment
        }

        // next all encryption is true
        fragment.encryption = true
        key.uri = key.uri.startsWith("http") ? key.uri : url.resolve(fragment.uri, key.uri)
        // get key
        if (this.keyCache[key.uri]) {
            key.key = this.keyCache[key.uri]
            // Using the key to identify the real encryption mode
            // be confined to AES-128-CBC | AES-192-CBC | AES-256-CBC, default AES-128-CBC
            key.method = detectAesMode(this.keyCache[key.uri]) || "AES-128-CBC"
        } else {
            const requestOptions = Object.assign({}, this.options.requestOptions)
            const keyResponse = await got(key.uri, { ...requestOptions, responseType: "buffer" })
            key.key = keyResponse.body.buffer
            key.method = detectAesMode(key.key) || "AES-128-CBC"
            this.keyCache[key.uri] = key.key
        }

        // reset fragment.key
        fragment.key = key
        return fragment
    },
})
