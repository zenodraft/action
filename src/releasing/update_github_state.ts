import { create_github_release } from './create_github_release'
import { update_github_release } from './update_github_release'
import { Payload } from './types'
import * as github from '@actions/github'



export const update_github_state = async (payload: Payload, upsert_doi: boolean, filename: string) => {
    if (payload.event === 'ReleasePublished') {
        await update_github_release(payload, upsert_doi)
    } else if (payload.event === 'WorkflowDispatch') {
        await create_github_release(payload, upsert_doi, filename)
    } else {
        throw new Error(`Unsupported event: "${github.context.eventName}".`)
    }
}
