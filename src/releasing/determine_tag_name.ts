import { load_cff_file } from './../upserting/load_cff_file'
import * as fs from 'fs'
import assert from 'assert'
import { get_commit_string } from './get_commit_string'



export const determine_tag_name = async (filename: string): Promise<string> => {

    const version_commit = await get_commit_string()

    let version_cff: string | undefined
    try {
        version_cff = load_cff_file().version!.toString()
    } catch (err) {
        version_cff = undefined
    }

    let version_zenodo: string | undefined    
    try {
        version_zenodo = JSON.parse(fs.readFileSync(filename, 'utf8')).version!.toString()
    }  catch (err) {
        version_zenodo = undefined
    }

    if (version_zenodo !== undefined && version_cff !== undefined) {
        assert(version_cff === version_zenodo, `Inconsistent versions found in CITATION.cff and ${filename}`)
    }

    if (filename === '') {
        return version_zenodo || version_cff || version_commit
    } else if (filename === 'CITATION.cff') {
        return version_cff || version_commit
    } else {
        return version_zenodo || version_commit
    }
}
