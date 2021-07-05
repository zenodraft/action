import { CffObject } from './types'
import * as fs from 'fs'
import * as yaml from 'js-yaml'



export const write_cff_file = (cff: CffObject): void => {
    let cffstr = yaml.dump(cff, { sortKeys: false })
    // replace full precision dates with just YYYY-MM-DD before writing to file
    const regexes = [
        new RegExp('(?<k>date-accessed): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-downloaded): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-published): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-released): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-end): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g'),
        new RegExp('(?<k>date-start): (?<v>[0-9]{4}-[0-9]{2}-[0-9]{2})T00:00:00.000Z', 'g')
    ]
    for (const regex of regexes) {
        cffstr = cffstr.replace(regex, '$<k>: $<v>')
    }
    fs.writeFileSync('CITATION.cff', cffstr, 'utf8')
    return
}
