import path from "path";
import crypto from "crypto";
import { statSync as stat, readdir, readdirSync, existsSync, mkdirSync } from "fs";
function getRowType(value) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
export function isObject(value) {
    return getRowType(value) === "object";
}
export function isFunction(value) {
    const rowType = getRowType(value);
    return rowType === "function" || rowType === "asyncfunction";
}
export function isString(value) {
    return getRowType(value) === "string";
}
export function isDirectory(path) {
    return stat(path).isDirectory();
}
export function detectAesMode(key) {
    if (!key) {
        throw new Error("Invalid AES mode!");
    }
    if (!Buffer.isBuffer(key)) {
        key = Buffer.from(key);
    }
    if (key.length === 16) {
        return "AES-128-CBC";
    }
    else if (key.length === 24) {
        return "AES-192-CBC";
    }
    else if (key.length === 32) {
        return "AES-256-CBC";
    }
    else {
        throw new Error("Invalid AES mode!");
    }
}
export function isWebLink(link) {
    return /^https?:\/\//.test(link);
}
export function checkDirectory(path, suffix) {
    // Check the directory and downloaded fragments
    if (existsSync(path)) {
        let files = readdirSync(path);
        const numbers = [];
        for (let i = 0; i < files.length; i++) {
            const filename = files[i];
            if (suffix && !filename.endsWith(suffix)) {
                continue;
            }
            const number = parseInt(filename.split(".")[0]);
            numbers.push(number);
        }
        const index = findArithmeticProgressionMax(numbers);
        return index ? index - 1 : index;
    }
    else {
        mkdirSync(path, { recursive: true });
        return 0;
    }
}
export function zeroPad(number, width) {
    const strNumber = String(number);
    const padding = "0".repeat(Math.max(0, width - strNumber.length));
    return padding + strNumber;
}
export function findArithmeticProgressionMax(arr, range = 1) {
    if (!arr || arr.length === 0) {
        return 0;
    }
    // Intercept consecutive numbers
    arr.sort((a, b) => a - b);
    let current = arr[0], successive = [];
    for (let i = 0; i < arr.length; i++) {
        const number = arr[i];
        if (number !== current) {
            break;
        }
        successive.push(number);
        current += range;
    }
    // Get the largest number among consecutive numbers
    return Math.max(...successive);
}
export function createMd5(content) {
    return crypto.createHash("md5").update(content).digest("hex");
}
export function readDirFiles(dir) {
    return new Promise((resolve, reject) => {
        readdir(dir, (err, files) => {
            if (err) {
                return reject(err);
            }
            const fileList = [];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const filePath = path.join(dir, file);
                if (!isDirectory(filePath)) {
                    fileList.push(filePath);
                }
            }
            resolve(files);
        });
    });
}
