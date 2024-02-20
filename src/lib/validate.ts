import { isFunction, isObject, isString, isDirectory } from "../utilities.js"
import type { optionsType } from "../types/index.js"
import fs from "fs"


function hasFileExtension(fileName: string): boolean {
    return isString(fileName) && fileName.split(".").length > 1
}


export default function validate(options: optionsType): optionsType {
    // options
    if (!isObject(options)) {
        throw new Error("options is not Object!")
    }

    if (!options.input || !isString(options.input)) {
        throw new Error("options.input is not String!")
    }

    if (options.concurrency) {
        const concurrency = Number(options.concurrency)
        if (isNaN(concurrency)) {
            throw new Error("options.concurrency is not Number!")
        }
        options.concurrency = Math.ceil(Math.abs(concurrency))
    }

    // save and temp path
    if (options.path) {
        if (!isString(options.path)) {
            throw new Error("options.path is not String!")
        }
        try {
            isDirectory(options.path)
        } catch (error) {
            fs.mkdirSync(options.path, { recursive: true })
        }
    }

    if (options.tempDir) {
        if (!isString(options.tempDir)) {
            throw new Error("options.tempDir is not String!")
        }
        try {
            isDirectory(options.tempDir)
        } catch (error) {
            fs.mkdirSync(options.tempDir, { recursive: true })
        }
    }

    // filenames
    // ffmpeg requires a file suffix
    if (!hasFileExtension(options.name)) {
        // options.name = options.name.toString() || options.name.valueOf() || ""
        throw new Error("options.name is not a file suffix, it must '.'!")
    }

    if (!hasFileExtension(options.decodeSuffix)) {
        throw new Error("options.decodeSuffix is not a file suffix, it must '.'!")
    }

    if (!hasFileExtension(options.encodeSuffix)) {
        throw new Error("options.encodeSuffix is not a file suffix, it must '.'!")
    }

    if (options.decodeSuffix === options.encodeSuffix) {
        throw new Error("options.decodeSuffix and options.encodeSuffix must be different!")
    }

    // requestOptions
    if (options.requestOptions && !isObject(options.requestOptions)) {
        throw new Error("options.requestOptions is not a Object!")
    }

    // callbacks
    if (options.parsered && !isFunction(options.parsered)) {
        throw new Error("options.parsered is not a Function!")
    }

    if (options.onchange && !isFunction(options.onchange)) {
        throw new Error("options.onchange is not a Function!")
    }

    if (options.parser && !isFunction(options.parser)) {
        throw new Error("options.parser is not a Function!")
    }

    if (options.downloaded && !isFunction(options.downloaded)) {
        throw new Error("options.downloaded is not a Function!")
    }

    // false by default
    options.clear = Boolean(options.clear || false)

    return options
}
