# 📖简介

使用Nodejs开发的一款命令式m3u8下载器

# 使用方法

## 1. 全局安装

请确保Nodejs>=v16.0.0

如果您没有安转Nodejs，请先安装[Nodejs](https://nodejs.org)

```
npm install -g m3u8-downloader-mp4
```

## 2. 下载尝试

提示：当您使用url下载时，应该注意url中是否携带'&'符号（'&'在CMD中代表串联多个命令）。如果携带，请使用双引号将url包裹起来，例如：`mdown --url "https://example.com/example.m3u8?a=1&b=2"`

```bash
mdown --url <m3u8-url> [--path <save-path>] [--name <file-name>] 
```

或者下载本地m3u8文件

```bash
mdown --input <m3u8-file-path> [--path <save-path>] [--name <file-name>] 
```
