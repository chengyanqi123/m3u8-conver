# 📖Introduction

Convert network or local m3u8 files to media files (such as mp4, avi, etc.)

# 🚀Install

Make sure Nodejs>=v16.0.0

If you do not install Nodejs, Please install [Nodejs](https://nodejs.org)

```bash
# npm
npm install m3u8-conver-core

# pnpm
pnpm install m3u8-conver-core
```

# 🚗Use

custom parser see [✏️Advanced](#✏️Advanced)

```js
import mconver from "../index.js"
const options = {
    url: "https://www.test.com",
    // input: "1.m3u8",
}

const output = await mconver(options)
// or callbacks
await mconver(options, {
  parsered(fragments) {
      console.log("parsered")
  },
  downloadChange(total, current, fragment) {
      console.log(`downloading... [${current + 1}/${total}]\r`)
  },
  ...
})
console.log("convered path: ", output)
```

# 🔧Options

## options

- **`url`[String]**: indicates the url of the m3u8 file to be converted
- **`input`[String]**: indicates the local m3u8 file to be converted
- **`path`[String]**: save path after conversion. Default: save path of the current terminal
- **`name`[String]**: indicates the converted file name (including the suffix). The default value is "execute timestamp.mp4".
- **`tempDir`[String]**: indicates the temporary save path for ts chips. Default value: path.resolve(__dirname, '.temp'),
- **`encodeSuffix`[String]**: indicates the suffix of an undecrypted ts slice. The default is ".encode".
- **`decodeSuffix`[String]**: decrypted or undecrypted ts slice suffix. Default: ".ts"
- **`clear`[Boolean]**: Specifies whether to execute only the clear cache

## callbacks

- parsered(fragments)

  - **`fragments`[Array]**: indicates information about all fragments after resolution

- downloadChange(total, current, fragment)

  - **`total`[Number]**: indicates the total number
  - **`current`[Number]**: indicates the current index
  - **`fragment`[Object]**: indicates information about the current ts fragment

- parserHandler(fragment, index)
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

- **index[Number]**: indicates the index of the current ts segment

## Parser return value

> The parser must return a 'fragment' object, and if there is an encryption argument (' fragment.key '), it must ensure its correctness.

Because when you use a custom parser, our parser will not execute, and the returned fragment will be used as the basis for subsequent decryption and download of m3u8. If the encryption parameter of 'fragment' returned is incorrect, the m3u8 file cannot be successfully converted. If there is no encryption parameter, ignore it.

## Example

The following example is a partial implementation of our parser, which you can use as a reference to implement your own parser.

```js
async function parserHandler(fragment, index) {
    // fragment ts uri has portcol?
    // if not, use resolve merge `options.url`(m3u8 file url)
    fragment.uri = fragment.uri.startsWith("http")
        ? fragment.uri
        : url.resolve(this.options.url/* options.url  */, fragment.uri)

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
```
