import { WorkflowDispatchEvent, ReleaseEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'
import * as core from '@actions/core'
import * as github from '@actions/github'
import assert from 'assert'



type Payload = {
    event: 'workflow_dispatch'
    contents: WorkflowDispatchEvent
} | {
    event: 'release_published'
    contents: ReleasePublishedEvent
}



const create_github_release = (payload: WorkflowDispatchEvent): void => {
    core.info(JSON.stringify(payload, null, 4))
    const github_token = process.env.GITHUB_TOKEN
    assert(github_token !== undefined, 'I don\'t see the GITHUB_TOKEN in the environment.')
    const octokit = github.getOctokit(github_token)

    const [owner, repo] = payload.repository.full_name.split('/').slice(0, 2)
    const tag_name = get_version_from_zenodo_metadata()
    const options = {
        name: tag_name,
        body: 'zenodraft automated release triggered by workflow_dispatch event'
    }
    octokit.rest.repos.createRelease({owner, repo, tag_name, ...options})
    // determine what the tag value should be
    // determine what sha is going to be released
    // create the tag for the sha
    // create the release
}



const get_payload = (): Payload  => {

    if (github.context.eventName === 'workflow_dispatch') {
        return {
            event: 'workflow_dispatch',
            contents: github.context.payload as WorkflowDispatchEvent
        }
    }

    if (github.context.eventName === 'release') {
        const release_event_payload = github.context.payload as ReleaseEvent
        if (release_event_payload.action === 'published') {
            return {
                event: 'release_published',
                contents: release_event_payload as ReleasePublishedEvent
            }
        } else {
            const msg = `Unsupported type of release event: "${release_event_payload.action}".`
            core.setFailed(msg)
            throw new Error(msg)
        }
    }
    const msg = `Unsupported event: "${github.context.eventName}".`
    core.setFailed(msg)
    throw new Error(msg)
}



const get_version_from_zenodo_metadata = (): string => {
    return '0.0.6'
}



const move_git_tag = (payload: ReleasePublishedEvent): void => {
    core.info(JSON.stringify(payload, null, 4))
    // get the tag from the release
    // const tag_name = payload.release.tag_name

}



export const update_github_state = () => {
    const payload = get_payload()
    if (payload.event === 'release_published') {
        move_git_tag(payload.contents)
    } else if (payload.event === 'workflow_dispatch') {
        create_github_release(payload.contents)
    } else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`)
    }
}
