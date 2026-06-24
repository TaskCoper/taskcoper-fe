import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { GetProjectResourcesParams } from './hooks/use-get-project-resources'
import type { ProjectResource } from './types'
import type { UploadProjectAttachmentFormValues } from './validations'

class ProjectResourceService extends BaseService {
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
    const { data } = await this.get<BasePaginationResponse<ProjectResource>>(
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
    const { data } = await this.post<BaseResponse<string>>(
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
    const { data } = await this.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources/${resourceId}`
    )

    return data.value
  }
}

const projectResourceService = new ProjectResourceService()
export default projectResourceService
