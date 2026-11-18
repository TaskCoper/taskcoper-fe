import { api, type BasePaginationResponse } from '@/lib/axios'
import type { GetProjectActivitiesParams } from './hooks/use-get-project-activities'
import type { ProjectActivity } from './types'

class ProjectActivityService {
  private readonly baseUrl = 'projects'

  getProjectActivities = async ({
    projectIdentifier,
    pageIndex,
    pageSize,
    searchTerm,
    from,
    to,
    actorUserId
  }: GetProjectActivitiesParams) => {
    if (!projectIdentifier) return null

    const { data } = await api.get<BasePaginationResponse<ProjectActivity>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/activities`,
      {
        params: {
          pageIndex,
          pageSize,
          searchTerm,
          from,
          to,
          actorUserId
        }
      }
    )

    return data
  }
}

const projectActivityService = new ProjectActivityService()
export default projectActivityService
