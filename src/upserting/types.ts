export type Identifier = {
    type: 'doi' | 'swh' | 'url' | 'other',
    value: string,
    description?: string
}



export type CffObject = {
    'cff-version': string,
    doi?: string,
    identifiers?: Array<Identifier>,
    version?: string | number
}
