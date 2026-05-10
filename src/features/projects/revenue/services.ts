import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { RevenueLabel } from '@/features/projects/revenue/types'
import type { GetProjectRevenueParams } from './hooks/use-get-project-revenue'
import type { Revenue } from './types'
import type {
  AddProjectRevenueFormValues,
  AddProjectRevenueLabelFormValues,
  UpdateProjectRevenueFormValues,
  UpdateProjectRevenueLabelFormValues
} from './validations'

class ProjectRevenueService {
  private readonly baseUrl = 'projects'

  getProjectRevenue = async ({
    projectIdentifier,
    pageIndex,
    pageSize,
    labelIds,
    searchTerm,
    type,
    sortBy,
    startDate,
    endDate
  }: GetProjectRevenueParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<Revenue>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues`,
      {
        params: {
          pageIndex,
          pageSize,
          labelIds,
          searchTerm,
          type,
          sortBy,
          startDate,
          endDate
        }
      }
    )

    return data
  }

  addProjectRevenue = async ({ body }: { body: AddProjectRevenueFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues`,
      body
    )

    return data.value
  }

  updateProjectRevenue = async ({ body }: { body: UpdateProjectRevenueFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues/${body.projectTransactionId}`,
      body
    )

    return data.value
  }

  deleteProjectRevenue = async ({ projectIdentifier, revenueId }: { projectIdentifier: string; revenueId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/${revenueId}`
    )

    return data.value
  }

  getProjectRevenueLabels = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<RevenueLabel>()
    const { data } = await api.get<BasePaginationResponse<RevenueLabel>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/labels`
    )

    return data
  }

  addProjectRevenueLabel = async ({ body }: { body: AddProjectRevenueLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues/labels`,
      body
    )

    return data.value
  }

  updateProjectRevenueLabel = async ({ body }: { body: UpdateProjectRevenueLabelFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues/labels/${body.id}`,
      body
    )

    return data.value
  }

  deleteProjectRevenueLabel = async ({
    projectIdentifier,
    labelId
  }: {
    projectIdentifier: string
    labelId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/labels/${labelId}`
    )

    return data.value
  }
}

const projectRevenueService = new ProjectRevenueService()
export default projectRevenueService
