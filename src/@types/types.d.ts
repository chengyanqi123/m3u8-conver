declare module 'm3u8-parser' {
    import 'm3u8-parser'
    export type Parser = {
        push: (data: string) => void,
        end: () => void
    }
}

export type requestMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type ArrayBufferLikeType = string | ArrayBuffer | Buffer | undefined | ''

/* 
 */
export type FragmentKeyType = {
    method: string,
    uri: string | undefined | '',
    key: ArrayBufferLikeType,
    iv: ArrayBufferLikeType
}


export type cacheType = Map<string, ArrayBufferLikeType>

/* 
 */
export type FragmentType = {
    duration: number,
    uri: string,
    key: FragmentKeyType,
    padIndex: string,
    encodePath: string,
    decodePath: string,
    encryption?: boolean
}

/* 
 */
export type optionsType = {
    input: string,
    concurrency: number,
    path: string,
    name: string,
    tempDir: string,
    encodeSuffix: string,
    decodeSuffix: string,
    clear: boolean,
    requestOptions: object,
    parser?: (fragment: FragmentType, index: number) => FragmentType
    onchange?: (total: number, current: number, fragment: FragmentType) => void,
    parsered?: (fragments: Array<FragmentType>) => FragmentType,
}

export type parserModel = 'Local' | 'Cloud'