import type {
  AddMilestoneFormValues,
  AddParentMilestoneFormValues,
  MoveMilestoneFormValues
} from '@/features/milestones/validations'
import api, { type BaseResponse } from '@/lib/axios'

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

  moveMilestone = async ({ body }: { body: MoveMilestoneFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.milestoneId}`, body)

    return data.value
  }
}

const milestoneService = new MilestoneService()
export default milestoneService
