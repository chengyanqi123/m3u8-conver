# 📖简介

将网络或者本地的m3u8文件转换成媒体文件(如: mp4、avi等)

# 🚀安装

请确保Nodejs>=v16.0.0

如果您没有安装Nodejs，请先安装[Nodejs](https://nodejs.org)

```
# npm
npm install m3u8-conver-core
# pnpm 
pnpm install m3u8-conver-core
```

# 🚗使用

```js
import mconver from "m3u8-conver-core"

const parsered = (fragments) => {
    console.log(fragments)
}
const downloadChange = (total, current, fragment) => {
    console.log(`downloading... [${current + 1}/${total}]\r`)
}
const options = {
    url: "https://www.test.com",
    name: "output.mp4"
    // input: "./test.m3u8",
}

const ouput = await mconver(options, parsered, downloadChange)
console.log("convered path: ", ouput)
```

# 🔧选项

## options

- **url[String]**: 需要转换m3u8文件的url
- **input[String]**: 需要转换的m3u8本地文件
- **path[String]**: 转换后的保存路径, 默认: 当前终端执行的路径
- **name[String]**: 转换后的文件名(包含后缀), 默认: "执行时间戳.mp4"
- **tempDir[String]**: ts片的临时保存路径, 默认: path.resolve(__dirname, '.temp'),
- **encodeSuffix[String]**: 未解密的ts片后缀, 默认为: ".encode"
- **decodeSuffix[String]**: 已解密或者无需解密的ts片后缀, 默认: ".ts"
- **clear[Boolean]**: 是否只执行清楚缓存

## parsered(fragments)

- **fragments[Array]**: 解析后的所有片段信息

## downloadChange(total, current, fragment)

- **total[Number]**: 总数
- **current[Number]**: 当前索引
- **fragment[Object]**: 当前的ts片段信息
