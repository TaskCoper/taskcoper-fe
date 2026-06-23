import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetMilestonesParams } from './hooks/use-get-milestones'
import type { GetMyProjectsParams } from './hooks/use-get-my-projects'
import type { GetProjectsParams } from './hooks/use-get-projects'
import type { MilestoneWithTasks, ParentMilestone, Project, ProjectPreview, SystemProject, TaskPreview } from './types'
import type { CreateProjectFormValues, UpdateProjectFormValues } from './validations'

class ProjectService extends BaseService {
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
    const { data } = await this.get<BasePaginationResponse<SystemProject>>(`/v1/${this.baseUrl}`, {
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
    const { data } = await this.get<BaseResponse<Project>>(`/v1/${this.baseUrl}/${identifier}`)

    return data.value
  }

  getMyProjects = async ({ userId, status, searchTerm, pageIndex, pageSize }: GetMyProjectsParams) => {
    const { data } = await this.get<BasePaginationResponse<ProjectPreview>>(`/v1/${this.baseUrl}/user`, {
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
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  updateProject = async ({ body }: { body: Omit<UpdateProjectFormValues, 'domainIds'> & { domainIds: string[] } }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectId}`, body)

    return data.value
  }

  deleteProject = async ({ projectIdentifier }: { projectIdentifier: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${projectIdentifier}`)

    return data.value
  }

  getProjectsForPackage = async () => {
    const { data } = await this.get<
      BasePaginationResponse<Pick<Project, 'id' | 'slug' | 'name' | 'logoImage' | 'coverImage'>>
    >(`/v1/${this.baseUrl}/me/bookable-for-mentor-package`)

    return data
  }

  getMyAssignedTasks = async ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
    if (!projectIdentifier || !userId) return null
    const { data } = await this.get<BasePaginationResponse<TaskPreview>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}/tasks`
    )

    return data
  }

  getParentMilestones = async ({ identifier }: { identifier?: string }) => {
    if (!identifier) return null
    const { data } = await this.get<BasePaginationResponse<ParentMilestone>>(
      `/v1/${this.baseUrl}/${identifier}/milestones/parents`
    )

    return data
  }

  getMilestones = async ({ projectIdentifier, parentMilestoneIdentifier }: GetMilestonesParams) => {
    if (!projectIdentifier || !parentMilestoneIdentifier) return null
    const { data } = await this.get<BaseResponse<MilestoneWithTasks>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/milestones/${parentMilestoneIdentifier}`
    )

    return data.value
  }
}
const projectService = new ProjectService()
export default projectService
