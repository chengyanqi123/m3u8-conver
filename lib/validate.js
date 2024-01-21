import { isFunction, isObject, isString } from "./utilities.js"

function hasFileExtension(fileName) {
    return isString(fileName) && fileName.split(".").length > 1
}

export default function validate(options) {
    // options
    if (!isObject(options)) {
        throw new Error("options is not Object!")
    }

    // url and input
    if (!options.url && !options.input && !options.clear) {
        throw new Error("options is missing parameter url or input!")
    }

    if (options.url && !isString(options.url)) {
        throw new Error("options.url is not String!")
    }

    if (options.input && !isString(options.input)) {
        throw new Error("options.input is not String!")
    }

    if (options.concurrency) {
        const concurrency = Number(options.concurrency)
        if (isNaN(concurrency)) {
            throw new Error("options.concurrency is not Number!")
        }
        if (!Number.isInteger(concurrency) || concurrency < 1) {
            throw new Error("options.concurrency is not Integer or less than 1!")
        }
        options.concurrency = concurrency
    }

    // save and temp path
    if (options.path && !isString(options.path)) {
        throw new Error("options.path is not String!")
    }

    if (options.tempDir && !isString(options.tempDir)) {
        throw new Error("options.tempDir is not String!")
    }

    // filenames
    if (!hasFileExtension(options.name)) {
        throw new Error("options.name is not a file suffix, it must '.'!")
    }

    if (!hasFileExtension(options.decodeSuffix)) {
        throw new Error("options.decodeSuffix is not a file suffix, it must '.'!")
    }

    if (!hasFileExtension(options.decodeSuffix)) {
        throw new Error("options.decodeSuffix is not a file suffix, it must '.'!")
    }

    if (options.decodeSuffix === options.decodeSuffix) {
        throw new Error("options.decodeSuffix and options.name must be different!")
    }

    // requestOptions
    if (options.requestOptions && !isObject(options.requestOptions)) {
        throw new Error("options.requestOptions is not a Object!")
    }

    // callbacks
    if (options.onparsered && !isFunction(options.onparsered)) {
        delete options.onparsered
    }

    if (options.onchange && !isFunction(options.onchange)) {
        delete options.onchange
    }

    if (options.parser && !isFunction(options.parser)) {
        delete options.parser
    }

    // false by default
    options.clear = Boolean(options.clear || false)

    return options
}
