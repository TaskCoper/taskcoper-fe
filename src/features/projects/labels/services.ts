import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Label } from '@/types/label.type'
import type { AddProjectLabelFormValues, UpdateProjectLabelFormValues } from './validations'

class ProjectLabelService {
  private readonly baseUrl = 'projects'

  getProjectLabels = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<Label>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/task-labels`
    )

    return data
  }

  addProjectLabel = async ({ body }: { body: AddProjectLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/task-labels`,
      body
    )

    return data.value
  }

  updateProjectLabel = async ({ body }: { body: UpdateProjectLabelFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/task-labels/${body.id}`, body)

    return data.value
  }

  deleteProjectLabel = async ({ labelId }: { labelId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/task-labels/${labelId}`)

    return data.value
  }
}

const projectLabelService = new ProjectLabelService()
export default projectLabelService
