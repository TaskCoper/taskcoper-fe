import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMemberPositionTitle, ProjectPositionTitle } from './types'
import type { AddProjectPositionTitleFormValues, UpdateProjectPositionTitleFormValues } from './validations'

class ProjectPositionTitleService {
  private readonly baseUrl = 'projects'

  getProjectPositionTitles = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<ProjectPositionTitle>()
    const { data } = await api.get<BasePaginationResponse<ProjectPositionTitle>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles`
    )

    return data
  }

  addProjectPositionTitle = async ({ body }: { body: AddProjectPositionTitleFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/position-titles`,
      body
    )

    return data.value
  }

  updateProjectPositionTitle = async ({ body }: { body: UpdateProjectPositionTitleFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/position-titles/${body.titleId}`,
      body
    )

    return data.value
  }

  deleteProjectPositionTitle = async ({
    projectIdentifier,
    titleId
  }: {
    projectIdentifier: string
    titleId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles/${titleId}`
    )
    return data.value
  }

  assignProjectPositionTitle = async ({
    projectIdentifier,
    titleId,
    userId
  }: {
    projectIdentifier: string
    titleId: string
    userId: string
  }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles/${titleId}/members`,
      {
        userId,
        projectIdentifier,
        titleId
      }
    )

    return data.value
  }

  unassignProjectPositionTitle = async ({
    projectIdentifier,
    titleId,
    userId
  }: {
    projectIdentifier: string
    titleId: string
    userId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles/${titleId}/members/${userId}`
    )

    return data.value
  }

  getProjectMemberPositionTitles = async ({
    projectIdentifier,
    userId
  }: {
    projectIdentifier?: string
    userId?: string
  }) => {
    if (!projectIdentifier || !userId) return getDefaultPaginationResponse<ProjectMemberPositionTitle>()
    const { data } = await api.get<BasePaginationResponse<ProjectMemberPositionTitle>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}/position-titles`
    )

    return data
  }
}

const projectPositionTitleService = new ProjectPositionTitleService()
export default projectPositionTitleService
