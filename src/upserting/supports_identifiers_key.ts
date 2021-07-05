import { CffObject } from './types'



export const supports_identifiers_key = (cff: CffObject): boolean => {
    const cff_version = cff['cff-version'] || ''
    const versions = ['1.1.0', '1.2.0']
    return versions.includes(cff_version)
}
