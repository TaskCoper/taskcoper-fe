import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { Label } from './types'
import type { AddProjectLabelFormValues, UpdateProjectLabelFormValues } from './validations'

class ProjectLabelService extends BaseService {
  private readonly baseUrl = 'projects'

  getProjectLabels = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await this.get<BasePaginationResponse<Label>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/task-labels`
    )

    return data
  }

  addProjectLabel = async ({ body }: { body: AddProjectLabelFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/task-labels`,
      body
    )

    return data.value
  }

  updateProjectLabel = async ({ body }: { body: UpdateProjectLabelFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/task-labels/${body.id}`, body)

    return data.value
  }

  deleteProjectLabel = async ({ labelId }: { labelId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/task-labels/${labelId}`)

    return data.value
  }
}

const projectLabelService = new ProjectLabelService()
export default projectLabelService
