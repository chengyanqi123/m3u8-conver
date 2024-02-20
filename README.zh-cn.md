简体中文｜[English](./README.md)

# 📖简介

将网络或本地`m3u8`文件转换为媒体文件(如`mp4`, `avi`等)

- [x] 解码AES-123-CBC
- [x] 解码AES-192-CBC
- [x] 解码AES-256-CBC
- [X] 本地的m3u8转换下载
- [x] 自定义保存格式
- [x] 并发下载
- [x] 自定义m3u8解析器
- [x] 请求配置，自定义`Cookie`, `Referer`, `User-Agent`等

其他定制解析可提`issues`或者邮箱`erickcheng@163.com`

# 🚀安装

请确保`Nodejs>=v16.13.0`

如果您没有安装`Nodejs`, 请先安装[Nodejs](https://nodejs.org)

```bash
# npm
npm i m3u8-conver -g
# pnpm 
pnpm i m3u8-conver -g
```

# 🚗使用

## 1. 在命令行中使用

```bash
# help
mconver -h
# 将"https://www.test.com/test.m3u8"转换为当前目录的"output.mp4", 并设置并发下载数量为10
mconver -i "https://www.test.com/test.m3u8" -o "./output.mp4" -c 10
# 或者解析本地文件, 同时设置输出路径为“./output.mp4” | 并发下载数量为“10”
mconver -i "./test.m3u8" -o "./output.mp4" -c 10
```

## 2. 在脚本中使用

自定义定义解析器请参考 [自定义解析器](#自定义解析器)

```js
import mconver from "m3u8-conver"
// 基本使用
const output = await mconver({
    url: "https://www.test.com",
})
console.log("convered path: ", output)

// 其他配置
// 更多配置详见文档 #Options
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
        // 自定义解析器 ...
        return fragment
    },
})
```

# 🔧选项

## options

- **`url`[String]**: 需要转换m3u8文件的url
- **`input`[String]**: 需要转换的m3u8本地文件路径
- **`path`[String]**: 转换后的保存路径, 默认: 当前终端路径。`process.cwd()`
- **`name`[String]**: 转换后的文件名(包含后缀), 默认: "执行时间戳.mp4"
- **`tempDir`[String]**: ts片的临时保存路径, 默认: m3u8-conver项目的根路径。`path.resolve(__dirname, "../", ".temp")`
- **`encodeSuffix`[String]**: 未解密的ts片后缀, 默认为: ".encode"
- **`concurrency`[Number]**: 并发数, 默认: 1, 不开启并发
- **`decodeSuffix`[String]**: 已解密或者无需解密的ts片后缀, 默认: ".ts"
- **`clear`[Boolean]**: 是否只执行清楚缓存操作, 默认: false
- **`httpOptions`[httpOptions]**: 下载ts片的http选项, 默认: {}。以下是常见配置, 更多配置详见[got官网-options](https://github.com/sindresorhus/got/blob/3822412385506a1efef6580d270eae14086b9b43/documentation/2-options.md)。
  - **`method`[String]**: 请求方法, 默认: "GET"
  - **`headers`[Object]**: 请求头信息
  - **`timeout`[Object]**: 请求超时配置。详见[got官网-timeout](https://github.com/sindresorhus/got/blob/3822412385506a1efef6580d270eae14086b9b43/documentation/6-timeout.md)
  - **`body`[String|Buffer|Stream|Generator|AsyncGenerator|FormData|undefined]**: 请求体, 一般需配合`headers["Content-Type"]`使用

- **`parsered(fragments)`[Function]**: m3u8文件解析完成后的回调

  - **`fragments`[Array]**: 解析后的所有片段信息

- **`onchange(total, current, fragment)`[Function]**: 下载每一个ts片段完成时触发的回调

  - **`total`[Number]**: 总数
  - **`current`[Number]**: 当前索引
  - **`fragment`[Object]**: 当前的ts片段信息

- **`downloaded()`[Function]**: 所有分片信息下载完成后的回调

- **`parser(fragment, index)`[Function]**: 自定义解析器。详细用法请参考[自定义解析器](#自定义解析器)
  - **`fragment`[Object]**: 当前的ts片段信息
  - **`index`[Number]**: 当前片段的索引

# ✏️进阶

## 自定义解析器

> 在绝大多数的情况下, 您只需要使用我们提供的标准m3u8解析器, 而无需了解其内部实现。

为了提供更加灵活的使用方式, 我们提供了自定义解析器, 以满足不同的需求。

## 解析器参数

解析器必须是一个函数, 它的`this`指向为`Origin`实例, 如果您使用`箭头函数`, 那么您将不能访问其内部属性（如果您不需要内部属性, 可以忽略）。它携带两个参数`fragment`和`index`(当前执行片段的索引)

## fragment

- **`fragment`[Object]**: 解析后的所有ts片段

  - **`duration`[Number]**: 片段时长
  - **`uri`[String]**: 片段的uri链接
  - **`key`[Object]**: 加密参数, 如果没有则表示未加密
    - **`key.method`[String]**: 加密方法
    - **`key.uri`[String]**: 加密的key的uri链接
    - **`key.iv`[ArrayBuffer]**: 加密的iv
    - **`key.key`[ArrayBuffer]**: 加密的key内容, 通过`key.uri`获取
  - **`encryption`[Boolean]**: 该片段是否加密, 默认: `false`
  - **`timeline`[Number]**: 时间线

  - **`index`[Number]**: 当前ts片段的索引

## 解析器返回值

> 解析器必须返回一个`fragment`对象, 如果有加密参数(`fragment.key`), 必须确保其正确性。

因为当你使用自定解析器的时候, 我们的解析器将不会执行, 返回的`fragment`将作为后续解密和下载`ts`分片的依据。如果返回的`fragment`的加密参数不正确, 必然将无法成功转换`m3u8`文件, 如果没有加密参数请忽略。

## 示例

下面的示例是我们解析器的部分实现, 您可以将其作为参考, 以实现自己的解析器。

```js
import mconver from "m3u8-conver"
import got from "got"
import { detectAesMode } from "m3u8-conver/lib/utilities.js"

await mconver({
    url: "https://www.test.com",
    parser
})
async function parserHandler(fragment, index) {
    console.log("useing custom parser!")
    /*
    函数的内部this指向为Origin的实例
    解析器执行多次，您可以单独处理每个片段。 
     */

    // 当前ts片段的uri链接是否以http开头
    // 如果不是，则使用url.resolve转换完整的uri链接
    fragment.uri = fragment.uri.startsWith("http")
        ? fragment.uri
        : url.resolve(this.options.url /* options.url */, fragment.uri)

    // 如果没有key参数，则表示未加密
    // 直接返回fragment，无需处理
    const key = Object.assign({}, fragment.key)
    if (!key || Object.keys(key).length === 0) {
        return fragment
    }

    // 接下来都是处理加密参数的逻辑
    fragment.encryption = true
    key.uri = key.uri.startsWith("http") ? key.uri : url.resolve(fragment.uri, key.uri)
    // 获取秘钥
    // 如果有秘钥缓存，直接使用，避免重复获取，造成不必要的网络耗时
    if (this.keyCache[key.uri]) {
        key.key = this.keyCache[key.uri]
        // 使用密钥识别真实的加密方式
        // 局限于 AES-128-CBC | AES-192-CBC | AES-256-CBC, 默认为 AES-128-CBC
        key.method = detectAesMode(this.keyCache[key.uri]) || "AES-128-CBC"
    } else {
        const requestOptions = Object.assign({}, this.options.requestOptions)
        const keyResponse = await got(key.uri, { ...requestOptions, responseType: "buffer" })
        key.key = keyResponse.body.buffer
        key.method = detectAesMode(key.key) || "AES-128-CBC"
        this.keyCache[key.uri] = key.key
    }
    
    // 重新设置已经解析好的秘钥信息
    fragment.key = key
    // 返回fragment，这是必须的
    return fragment
}
```
