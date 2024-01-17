English｜[简体中文](./README.zh-cn.md)

# 📖Introduction

An imperative m3u8 downloader developed using Nodejs

# Usage

please be sure

If you do not have Nodejs installed, install it first[Nodejs](https://nodejs.org)

## 1. install globally

```
npm install -g m3u8-downloader-mp4
```

## 2. download m3u8 file

Notice: When you download using a url, you should pay attention to whether the url carries an '&' symbol('&' in CMD stands for concatenating multiple commands). If you do, wrap the url in double quotation marks, such as: `mdown --url "https://example.com/example.m3u8?a=1&b=2"`

```bash
mdown --url <m3u8-url> [--path <save-path>] [--name <file-name>] 
```

or download local m3u8 file

```bash
mdown --input <m3u8-file-path> [--path <save-path>] [--name <file-name>] 
```
