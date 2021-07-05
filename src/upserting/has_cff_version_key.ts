import { CffObject } from './types'



export const has_cff_version_key = (cff: CffObject): boolean => {
    return Object.keys(cff).includes('cff-version')
}
