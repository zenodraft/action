import { exec } from '@actions/exec'
import { get_octokit } from './get_octokit'
import { ReleasePublishedPayload } from './types'
import * as core from '@actions/core'



export const update_github_release = async (payload: ReleasePublishedPayload, upsert_doi: boolean): Promise<void> => {

    if (upsert_doi === true) {
        
        const [owner, repo] = payload.contents.repository.full_name.split('/').slice(0, 2)
        const release_id = payload.contents.release.id
        const target_commitish = payload.contents.release.target_commitish
        let tag_name = payload.contents.release.tag_name
        const options = {
            body: payload.contents.release.body || "",
            draft: payload.contents.release.draft,
            name: payload.contents.release.name || "",
            prerelease: payload.contents.release.prerelease,
            target_commitish: payload.contents.release.target_commitish
        }

        // https://gist.github.com/danielestevez/2044589
        await core.group('updating the tag with changes that resulted from upserting the prereserved doi', async () => {
            await exec('git', ['fetch', 'origin'])
            await exec('git', ['config', 'user.email', ''])
            await exec('git', ['config', 'user.name', 'zenodraft/action'])
            await exec('git', ['checkout', '-b', `${tag_name}-with-upserting-changes`])
            await exec('git', ['add', 'CITATION.cff'])
            await exec('git', ['commit', '-m', 'zenodraft/action updated the file CITATION.cff with the prereserved doi'])
            await exec('git', ['checkout', target_commitish])
            await exec('git', ['merge', `${tag_name}-with-upserting-changes`])
            await exec('git', ['push', 'origin', target_commitish])
            await exec('git', ['tag', '-d', tag_name])
            await exec('git', ['push', 'origin', `:${tag_name}`])
            await exec('git', ['fetch', '--tags'])
            await exec('sleep', ['10'])
        })

        const octokit = get_octokit()
        octokit.rest.repos.deleteRelease({owner, repo, release_id})
        octokit.rest.repos.createRelease({owner, repo, tag_name, ...options})

    }
}
