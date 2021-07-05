import { determine_tag_name } from './determine_tag_name'
import { Payload } from './types'
import { WorkflowDispatchEvent, ReleaseEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'
import * as core from '@actions/core'
import * as github from '@actions/github'



export const get_payload = async (filename: string): Promise<Payload>  => {

    core.info(JSON.stringify(github.context.payload, null, 4))    

    if (github.context.eventName === 'workflow_dispatch') {
        return {
            contents: github.context.payload as WorkflowDispatchEvent,
            event: 'WorkflowDispatch',            
            tag: await determine_tag_name(filename)
        }
    }

    if (github.context.eventName === 'release') {
        let payload = github.context.payload as ReleaseEvent
        if (payload.action === 'published') {
            return {
                contents: payload as ReleasePublishedEvent,
                event: 'ReleasePublished',
                tag: payload.release.tag_name
            }
        } else {
            const msg = `Unsupported type of release event: "${payload.action}".`
            core.setFailed(msg)
            throw new Error(msg)
        }
    }
    const msg = `Unsupported event: "${github.context.eventName}".`
    core.setFailed(msg)
    throw new Error(msg)
}
