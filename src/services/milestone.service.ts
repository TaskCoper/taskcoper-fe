import type {
  AddMilestoneFormValues,
  AddParentMilestoneFormValues,
  UpdateMilestoneFormValues
} from '@/features/milestones/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { ChildMilestone } from '@/types/milestone.type'
import type { MilestoneTask } from '@/types/task.type'

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

  getChildMilestones = async ({ parentMilestoneId }: { parentMilestoneId?: string }) => {
    if (!parentMilestoneId) return null
    const { data } = await api.get<BasePaginationResponse<ChildMilestone>>(
      `/v1/${this.baseUrl}/${parentMilestoneId}/childrens`
    )

    return data
  }

  getMilestoneTasks = async ({ milestoneId }: { milestoneId?: string }) => {
    if (!milestoneId) return null
    const { data } = await api.get<BasePaginationResponse<MilestoneTask>>(`/v1/${this.baseUrl}/${milestoneId}/tasks`)

    return data
  }
}

const milestoneService = new MilestoneService()
export default milestoneService
