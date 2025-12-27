import type { GetMilestonesParams } from '@/features/projects/hooks/use-get-milestones'
import type { GetMyProjectsParams } from '@/features/projects/hooks/use-get-my-projects'
import type { CreateProjectFormValues } from '@/features/projects/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { ParentMilestone } from '@/types/milestone.type'
import type { MilestoneWithTasks, ProjectPreview } from '@/types/project.type'

class ProjectService {
  private readonly baseUrl = 'projects'

  getMyProjects = async ({ userId, status, searchTerm, pageIndex, pageSize }: GetMyProjectsParams) => {
    const { data } = await api.get<BasePaginationResponse<ProjectPreview>>(`/v1/${this.baseUrl}/user`, {
      params: {
        userId,
        status,
        searchTerm,
        pageIndex,
        pageSize
      }
    })

    return data
  }

  createProject = async ({ body }: { body: CreateProjectFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getParentMilestones = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ParentMilestone>>(
      `/v1/${this.baseUrl}/${projectId}/milestones/parents`
    )

    return data
  }

  getMilestones = async ({ projectId, parentMilestoneId }: GetMilestonesParams) => {
    if (!projectId || !parentMilestoneId) return null
    const { data } = await api.get<BaseResponse<MilestoneWithTasks>>(
      `/v1/${this.baseUrl}/${projectId}/milestones/${parentMilestoneId}`
    )

    return data.value
  }
}

const projectService = new ProjectService()
export default projectService
