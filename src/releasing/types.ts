import { WorkflowDispatchEvent, ReleasePublishedEvent } from '@octokit/webhooks-definitions/schema'



export type WorkflowDispatchPayload = {
    contents: WorkflowDispatchEvent    
    event: 'WorkflowDispatch'
    tag: string
}

export type ReleasePublishedPayload = {
    contents: ReleasePublishedEvent
    event: 'ReleasePublished'
    tag: string
}

export type Payload = WorkflowDispatchPayload | ReleasePublishedPayload
