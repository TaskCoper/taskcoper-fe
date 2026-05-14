import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { MilestoneStats } from '../analytics/types'
import type { MilestoneTask } from '../tasks/core/types'
import type { ChildMilestone } from './types'
import type { AddMilestoneFormValues, AddParentMilestoneFormValues, UpdateMilestoneFormValues } from './validations'

class MilestoneService {
  private readonly baseUrl = 'milestones'

  addParentMilestone = async ({ body }: { body: AddParentMilestoneFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  addMilestone = async ({ body }: { body: AddMilestoneFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  updateMilestone = async ({ body }: { body: UpdateMilestoneFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.milestoneId}`, body)

    return data.value
  }

  deleteMilestone = async ({ milestoneId }: { milestoneId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${milestoneId}`, {
      data: {
        milestoneId
      }
    })

    return data.value
  }

  getChildMilestones = async ({ parentMilestoneIdentifier }: { parentMilestoneIdentifier?: string }) => {
    if (!parentMilestoneIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ChildMilestone>>(
      `/v1/${this.baseUrl}/${parentMilestoneIdentifier}/childrens`
    )

    return data
  }

  getMilestoneTasks = async ({ milestoneId }: { milestoneId?: string }) => {
    if (!milestoneId) return null
    const { data } = await api.get<BasePaginationResponse<MilestoneTask>>(`/v1/${this.baseUrl}/${milestoneId}/tasks`)

    return data
  }

  getMilestoneStats = async ({ parentMilestoneIdentifier }: { parentMilestoneIdentifier?: string }) => {
    if (!parentMilestoneIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<MilestoneStats>>(
      `/v1/${this.baseUrl}/${parentMilestoneIdentifier}/statistics`
    )

    return data
  }
}

const milestoneService = new MilestoneService()
export default milestoneService
