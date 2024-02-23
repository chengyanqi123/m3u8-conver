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
npm i m3u8-conver -g

# pnpm
pnpm i m3u8-conver -g
```

# 🚗Use

## 1. Used on the command

```bash
# help
mconver -h
# Converts "https://www.test.com/test.m3u8" to the current directory "output. Mp4"
mconver -i "https://www.test.com/test.m3u8"
# or parser local file, and set output file, and set the number of concurrent downloads
mconver -i "./test.m3u8" -o "./output.mp4" -c 10
```

## 2. Used in the code

custom parser see [Custom-parser](#custom-parser)

```js
import mconver from "m3u8-conver"
// basic
const output = await mconver({
    input: "https://www.test.com",
})
console.log("convered path: ", output)

// other options
// More configuration see document #Options
await mconver({
    input: "https://www.test.com",
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

- **`*input`[String]**: indicates the url or local file of the m3u8 file to be converted
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

- **`downloaded()`[Function]**: Callback after downloading all fragment information

- **`parser(fragment, index)`[Function]**: custom parser, When this parameter is used, the internal parser will not execute, see [Custom parser](#Custom parser)
  - **`fragment`[Object]**: indicates information about the current ts fragment
  - **`index`[Number]**: indicates the current index

# ✏️Advanced

## Custom-parser

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
import got from "got" // or use other network request tools
import url from "url"
import { detectAesMode, isWebLink } from "m3u8-conver/dist/utilities.js"

await mconver({
    url: "https://www.test.com",
    parser
})

async function parser(fragment, index) {
    console.log("useing custom parser!")
    const uriIsWebLink = isWebLink(fragment.uri);
    if (this.model === 'Local' && !uriIsWebLink) {
        throw new Error("The download link is missing the host, please try using url mode!");
    }
    // fragment uri has portcol?
    fragment.uri = uriIsWebLink ? fragment.uri : url.resolve(this.options.input, fragment.uri);
    // if fragment not key, this not's encryption
    const key = Object.assign({}, fragment.key);
    if (!key || Object.keys(key).length === 0) {
        return fragment;
    }
    if (!key.uri || !key.iv) {
        throw new Error("The fragment encryption key or iv is missing the download link!");
    }
    // next all encryption is true
    key.uri = isWebLink(key.uri) ? key.uri : url.resolve(fragment.uri, key.uri);
    if (this.cache.get(key.uri)) {
        // Using the key to identify the real encryption mode
        // be confined to AES-128-CBC | AES-192-CBC | AES-256-CBC, default AES-128-CBC
        key.key = this.cache.get(key.uri);
    } else {
        const keyResponse = await got(key.uri, { ...this.options.requestOptions, responseType: "buffer" });
        const keyBuffer = Buffer.isBuffer(keyResponse.body.buffer) ? keyResponse.body.buffer : Buffer.from(keyResponse.body.buffer);
        this.cache.set(key.uri, keyBuffer);
        key.key = keyBuffer;
    }
    if (key.key) {
        key.method = detectAesMode(key.key);
    } else {
        key.method = "AES-128-CBC";
    }
    // reset fragment.key
    fragment.key = key;
    return fragment;
}
```
