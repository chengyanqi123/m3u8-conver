import fs from "fs"
import path from "path"
import crypto from "crypto"

export function isFunction(func) {
    return typeof func === "function"
}

export function zeroPad(number, width) {
    const strNumber = String(number)
    const padding = "0".repeat(Math.max(0, width - strNumber.length))
    return padding + strNumber
}

export function findArithmeticProgressionMax(arr, range = 1) {
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

export function createMd5(content) {
    return crypto.createHash("md5").update(content).digest("hex")
}

export function readDirFiles(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                return reject(err)
            }
            const fileList = []
            for (let index = 0; index < files.length; index++) {
                const file = files[index]
                const filePath = path.join(dir, file)
                if (fs.statSync(filePath).isDirectory()) {
                    continue
                }
                fileList.push(filePath)
            }
            resolve(files)
        })
    })
}
