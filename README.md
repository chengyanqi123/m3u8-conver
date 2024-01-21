English｜[简体中文](./README.zh-cn.md)

# 📖Introduction

Convert network or local `m3u8` files to media files (such as `mp4`, `avi`, etc.).

- [x] Decode AES-123-CBC
- [x] Decode AES-192-CBC
- [x] Decode AES-256-CBC
- [X] parser m3u8 localfile
- [X] custom save format.ext
- [x] concurrence download
- [x] custom m3u8 parser
- [x] request optons

# 🚀Install

Make sure`Nodejs>=v16.13.0`

If you do not install `Nodejs`, Please install [Nodejs](https://nodejs.org)

```bash
# npm
npm install m3u8-conver-core

# pnpm
pnpm install m3u8-conver-core
```

# 🚗Use

custom parser see [Custom parser](#Custom parser)

```js
import mconver from "m3u8-conver"
// basic
const output = await mconver({
    url: "https://www.test.com",
})
console.log("convered path: ", output)

// other options
// More configuration see document #Options
await mconver({
    url: "https://www.test.com",
    name: "output.mp4",
    concurrency: 6,
    requestOptions: {
        method: "GET",
        headers: {
            "x-token": "your token",
            Cookie: "your cookie",
        },
    },
    parsered(fragments) {
        console.log(fragments, "m3u8 parsered!")
    },
    onchange(total, current, fragment) {
        console.log(`downloading... [${current + 1}/${total}]\r`)
    },
    parser(fragment, index) {
        // custom parser ...
        return fragment
    },
})
```

# 🔧Options

## options

- **`*url`[String]**: indicates the url of the m3u8 file to be converted
- **`*input`[String]**: indicates the local m3u8 file to be converted
- **`concurrency`[Number]**: concurrency max number, default: 1
- **`path`[String]**: save path after conversion. Default: Execution root path. `process.cwd()`
- **`name`[String]**: indicates the converted file name (including the suffix). Default:  "execute timestamp.mp4". `new Date().getTime() + ".mp4"`
- **`tempDir`[String]**: indicates the temporary save path for ts chips. Default: `m3u8-conver`project root path. `path.resolve(__dirname, "../", ".temp")`,
- **`encodeSuffix`[String]**: indicates the suffix of an undecrypted ts slice. The default is ".encode".
- **`decodeSuffix`[String]**: decrypted or undecrypted ts slice suffix. Default: ".ts"
- **`clear`[Boolean]**: Specifies whether to execute only the clear cache, default: false.
- **`requestOptions`[httpOption]**: http[s] request options, default: {}. The following are common configurations. See more details[got-options](https://github.com/sindresorhus/got/blob/3822412385506a1efef6580d270eae14086b9b43/documentation/2-options.md).
  - **`method`[String]**: Request method, default: "GET"
  - **`headers`[Object]**: Request header information
  - **`timeout`[Object]**: Configure the request timeout. See details[got-timeout](https://github.com/sindresorhus/got/blob/3822412385506a1efef6580d270eae14086b9b43/documentation/6-timeout.md)
  - **`body`[String|Buffer|Stream|Generator|AsyncGenerator|FormData|undefined]**: The request body is generally used with headers["Content-Type"]

- **`parsered(fragments)`[Function]**: A callback function that is triggered when the solution is complete
  - **`fragments`[Array]**: indicates information about all fragments after resolution
  
- **`onchange(total, current, fragment)`[Function]**:  A callback function that is triggered when a fragment is downloaded
  - **`total`[Number]**: indicates the fragment total number
  - **`current`[Number]**: indicates the current index
  - **`fragment`[Object]**: indicates information about the current ts fragment
  
- **`parser(fragment, index)`[Function]**: custom parser, When this parameter is used, the internal parser will not execute, see [Custom parser](#Custom parser)
  - **`fragment`[Object]**: indicates information about the current ts fragment
  - **`index`[Number]**: indicates the current index

# ✏️Advanced

## Custom parser

> In the vast majority of cases, you only need to use the standard m3u8 parser we provide without knowing its internal implementation.

In order to provide a more flexible way to use, we provide custom parsers to meet different needs.

## Parser parameters

The parser must be a function whose 'this' points to an instance of Origin, and if you use an arrow function, then you won't be able to access its internal properties (if you don't need them, you can ignore them). It takes two arguments' fragment 'and' index '(the index of the currently executed fragment).

## fragment

- **`fragment`[Object]**: indicates all parsed ts fragments
  - **`duration`[Number]**: indicates the duration of the segment
  - **`uri`[String]**: uri link of the fragment
  - **`key`[Object]**: indicates an encryption parameter. If no, it indicates that no encryption is performed
    - **`key.method`[String]**: indicates the encryption method
    - **`key.uri`[String]**: uri link of the encrypted key
    - **`key.iv`[ArrayBuffer]**: indicates the encrypted iv
    - **`key.key`[ArrayBuffer]**: indicates the encrypted key content. The value is obtained by the uri
  - **encryption[Boolean]**: Specifies whether the segment is encrypted. The default value is false
  - **timeline[Number]**: Timeline

## Parser return value

> The parser must return a `fragment` object, and if there is an encryption argument (`fragment.key`), it must ensure its correctness.

Because when you use a custom parser, our parser will not execute, and the returned fragment will be used as the basis for subsequent decryption and download of `ts` fragment. If the encryption parameter of 'fragment' returned is incorrect, the m3u8 file cannot be successfully converted. If there is no encryption parameter, ignore it.

## Example

The following example is a partial implementation of our parser, which you can use as a reference to implement your own parser.

```js
import mconver from "m3u8-conver"
import got from "got"
import { detectAesMode } from "m3u8-conver/lib/utilities.js"

await mconver({
    url: "https://www.test.com",
    parser
})
async function parser(fragment, index) {
    console.log("useing custom parser!")
    // this --> Origin instance
    // The parser is executed multiple times, and you can handle each fragment individually.
    if (this.options.input /* options.input */ && !fragment.uri.startsWith("http")) {
        throw new Error(
            "The download link is missing the host, please try using url mode!"
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
}
```
