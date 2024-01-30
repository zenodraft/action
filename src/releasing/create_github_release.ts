import { exec } from '@actions/exec'
import { get_octokit } from './get_octokit'
import { WorkflowDispatchPayload } from './types'
import * as core from '@actions/core'
import { determine_tag_name as update_tag_name } from './determine_tag_name'



export const create_github_release = async (payload: WorkflowDispatchPayload, upsert_doi: boolean, filename: string): Promise<void> => {
    if (upsert_doi === true) {
        core.startGroup('updating the branch with changes that resulted from upserting the prereserved doi')
        await exec('git', ['config', 'user.email', ''])
        await exec('git', ['config', 'user.name', 'zenodraft/action'])
        await exec('git', ['add', 'CITATION.cff'])
        await exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi'])
        await exec('git', ['push'])
        payload.tag = await update_tag_name(filename)
        core.endGroup()
    }
    core.startGroup('creating the github release')
    const [owner, repo] = payload.contents.repository.full_name.split('/').slice(0, 2)
    const options = {
        name: payload.tag,
        body: 'zenodraft automated release triggered by workflow_dispatch event',
        target_commitish: payload.contents.ref
    }
    get_octokit().rest.repos.createRelease({owner, repo, tag_name: payload.tag, ...options})
    core.endGroup()
}
