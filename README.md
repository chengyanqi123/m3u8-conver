<head>
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/all.js"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.0.13/js/v4-shims.js"></script>
</head>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">

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

```js
import mconver from "m3u8-conver-core"

const parsered = (fragments) => {
    console.log(fragments)
}
const downloadChange = (total, current, fragment) => {
    console.log(`downloading...  [${current + 1}/${total}]\r`)
}
const options = {
    url: "https://www.test.com",
    name: "output.mp4"
    // input: "./test.m3u8",
}

const ouput = await mconver(options, parsered, downloadChange)
console.log("convered path: ", ouput)
```

# 🔧Options

## options

- url[String]: indicates the url of the m3u8 file to be converted
- input[String]: indicates the local m3u8 file to be converted
- path[String]: save path after conversion. Default: save path of the current terminal
- name[String]: indicates the converted file name (including the suffix). The default value is "execute timestamp.mp4".
- tempDir[String]: indicates the temporary save path for ts chips. Default value: path.resolve(__dirname, '.temp'),
- encodeSuffix [String]: indicates the suffix of an undecrypted ts slice. The default is ".encode".
- decodeSuffix [String]: decrypted or undecrypted ts slice suffix. Default: ".ts"
- clear[Boolean]: Specifies whether to execute only the clear cache

## parsered(fragments)

- fragments[Array]: indicates information about all fragments after resolution

## downloadChange(total, current, fragment)

- total[Number]: indicates the total number
- current[Number]: indicates the current index
- fragment[Object]: indicates information about the current ts fragment
