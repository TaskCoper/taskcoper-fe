import type { GetMilestonesParams } from '@/features/projects/core/hooks/use-get-milestones'
import type { GetProjectsParams } from '@/features/projects/core/hooks/use-get-projects'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetMyProjectsParams } from './hooks/use-get-my-projects'
import type { MilestoneWithTasks, ParentMilestone, Project, ProjectPreview, SystemProject, TaskPreview } from './types'
import type { CreateProjectFormValues, UpdateProjectFormValues } from './validations'

class ProjectService {
  private readonly baseUrl = 'projects'

  getProjects = async ({
    searchTerm,
    pageIndex,
    pageSize,
    startDate,
    endDate,
    organizationId,
    domainId,
    sortBy
  }: GetProjectsParams) => {
    const { data } = await api.get<BasePaginationResponse<SystemProject>>(`/v1/${this.baseUrl}`, {
      params: {
        searchTerm,
        pageIndex,
        pageSize,
        startDate,
        endDate,
        organizationId,
        domainId,
        sortBy
      }
    })

    return data
  }

  getProject = async ({ identifier }: { identifier?: string }) => {
    if (!identifier) return null
    const { data } = await api.get<BaseResponse<Project>>(`/v1/${this.baseUrl}/${identifier}`)

    return data.value
  }

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

  updateProject = async ({ body }: { body: Omit<UpdateProjectFormValues, 'domainIds'> & { domainIds: string[] } }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectId}`, body)

    return data.value
  }

  // TODO: implement this
  deleteProject = async () => {}

  getProjectsForPackage = async () => {
    const { data } = await api.get<
      BasePaginationResponse<Pick<Project, 'id' | 'slug' | 'name' | 'logoImage' | 'coverImage'>>
    >(`/v1/${this.baseUrl}/me/bookable-for-mentor-package`)

    return data
  }

  getMyAssignedTasks = async ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
    if (!projectIdentifier || !userId) return null
    const { data } = await api.get<BasePaginationResponse<TaskPreview>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}/tasks`
    )

    return data
  }

  getParentMilestones = async ({ identifier }: { identifier?: string }) => {
    if (!identifier) return null
    const { data } = await api.get<BasePaginationResponse<ParentMilestone>>(
      `/v1/${this.baseUrl}/${identifier}/milestones/parents`
    )

    return data
  }

  getMilestones = async ({ projectIdentifier, parentMilestoneIdentifier }: GetMilestonesParams) => {
    if (!projectIdentifier || !parentMilestoneIdentifier) return null
    const { data } = await api.get<BaseResponse<MilestoneWithTasks>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/milestones/${parentMilestoneIdentifier}`
    )

    return data.value
  }
}
const projectService = new ProjectService()
export default projectService
