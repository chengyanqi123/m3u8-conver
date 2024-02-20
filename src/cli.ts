#!/usr/bin/env node
import chalk from 'chalk';
import { MultiBar, Presets } from 'cli-progress'
import { Command } from "commander";
import conver from "./index.js";
import { resolve, basename } from 'path';
const program = new Command();

program
    .name('mconver')
    .version('1.0.0')
    .description(chalk.blue('Convert network or local m3u8 files into media files\n将网络或者本地的m3u8文件转换成媒体文件'))
    .option('-i, --input <path>', 'input m3u8 file path\t输入文件的路径名称')
    .option('-o, --output <path>', 'output media file path\t输出文件路径名称')
    .option('-c, --concurrency <number>', 'concurrent downloads number\t下载并发数量, default: 5')
program.parse()

// parser options
const options = program.opts();
options.concurrency = Number(options.concurrency);
if (options.output) {
    options.name = basename(options.output)
    options.output = options.output.replace(options.name, '')
    options.path = resolve(process.cwd(), options.output)
    delete options.output
}

// init progress-bar
let bar: any;
const multibar = new MultiBar({
    clearOnComplete: false,
    hideCursor: false,
    format: chalk.blue('[{bar}] [{value}/{total}] {percentage}% DUR: {duration_formatted} | ETA: {eta_formatted}'),
    align: 'left',
    fps: 10,
}, Presets.shades_classic);

// execute
console.log(chalk.blue("please parsering/解析中..."));
const path = await conver({
    ...options,
    parsered(fragments) {
        bar = multibar.create(fragments.length, 0)
    },
    onchange: (total: number, current: number) => {
        bar.update(current)
    },
    downloaded() {
        multibar.stop()
        console.log(chalk.blue("please merging/合并中..."));
    },
})
console.log(chalk.green("Donwlaod complete -> " + path));