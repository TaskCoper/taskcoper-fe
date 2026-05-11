import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetProjectResourcesParams } from './hooks/use-get-project-resources'
import type { ProjectResource } from './types'
import type { UploadProjectAttachmentFormValues } from './validations'

class ProjectResourceService {
  private readonly baseUrl = 'projects'

  getProjectResources = async ({
    projectIdentifier,
    pageIndex,
    pageSize,
    sortBy,
    name,
    from,
    to,
    mimeTypes,
    memberIds
  }: GetProjectResourcesParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectResource>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources`,
      {
        params: {
          pageIndex,
          pageSize,
          sortBy,
          searchTerm: name,
          from,
          to,
          mimeTypes,
          memberIds
        }
      }
    )

    return data
  }

  uploadProjectResource = async ({ body }: { body: UploadProjectAttachmentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/resources`,
      body
    )

    return data.value
  }

  deleteProjectResource = async ({
    projectIdentifier,
    resourceId
  }: {
    projectIdentifier: string
    resourceId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources/${resourceId}`
    )

    return data.value
  }
}

const projectResourceService = new ProjectResourceService()
export default projectResourceService
