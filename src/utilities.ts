import path from "path"
import crypto from "crypto"
import { statSync as stat, readdir, readdirSync, existsSync, mkdirSync } from "fs"
import type { ArrayBufferLikeType } from "./@types/types.js"

function getRowType(value: unknown): string {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

export function isObject(value: unknown): boolean {
    return getRowType(value) === "object"
}
export function isFunction(value: unknown): boolean {
    const rowType = getRowType(value)
    return rowType === "function" || rowType === "asyncfunction"
}
export function isString(value: unknown): boolean {
    return getRowType(value) === "string"
}

export function isDirectory(path: string): boolean {
    return stat(path).isDirectory()
}

export function detectAesMode(key: ArrayBufferLikeType): string {
    key = Buffer.isBuffer(key) ? key : Buffer.from(key)
    if (key.length === 16) {
        return "AES-128-CBC"
    } else if (key.length === 24) {
        return "AES-192-CBC"
    } else if (key.length === 32) {
        return "AES-256-CBC"
    }
    throw new Error("Invalid AES mode!")
}

export function isWebLink(link: string): boolean {
    return /^https?:\/\//.test(link)
}
export function checkDirectory(path: string, suffix?: string): number {
    // Check the directory and downloaded fragments
    if (existsSync(path)) {
        let files = readdirSync(path)
        const numbers = []
        for (let i = 0; i < files.length; i++) {
            const filename = files[i]
            if (suffix && !filename.endsWith(suffix)) {
                continue
            }
            const number = parseInt(filename.split(".")[0])
            numbers.push(number)
        }
        const index = findArithmeticProgressionMax(numbers)
        return index ? index - 1 : index
    } else {
        mkdirSync(path, { recursive: true })
        return 0;
    }
}

export function zeroPad(number: number | string, width: number): string {
    const strNumber = String(number)
    const padding = "0".repeat(Math.max(0, width - strNumber.length))
    return padding + strNumber
}

export function findArithmeticProgressionMax(arr: Array<number>, range = 1): number {
    if (!arr || arr.length === 0) {
        return 0
    }
    // Intercept consecutive numbers
    arr.sort((a, b) => a - b)
    let current = arr[0],
        successive = []
    for (let i = 0; i < arr.length; i++) {
        const number = arr[i]
        if (number !== current) {
            break
        }
        successive.push(number)
        current += range
    }
    // Get the largest number among consecutive numbers
    return Math.max(...successive)
}

export function createMd5(content: string): string {
    return crypto.createHash("md5").update(content).digest("hex")
}

export function readDirFiles(dir: string): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        readdir(dir, (err, files) => {
            if (err) {
                return reject(err)
            }
            const fileList = []
            for (let index = 0; index < files.length; index++) {
                const file = files[index]
                const filePath = path.join(dir, file)
                if (!isDirectory(filePath)) {
                    fileList.push(filePath)
                }
            }
            resolve(files)
        })
    })
}
