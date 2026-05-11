import api, { type BaseResponse } from '@/lib/axios'
import type { UpdateSubtaskFormValues, UpdateSubtaskStatusFormValues } from './validations'

class SubtaskService {
  private readonly baseUrl = 'subtasks'

  updateSubtask = async ({ body }: { body: UpdateSubtaskFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}`, body)

    return data.value
  }

  updateSubtaskStatus = async ({ body }: { body: UpdateSubtaskStatusFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}/checked`, body)

    return data.value
  }

  deleteSubtask = async ({ id }: { id: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`, {
      data: { id }
    })

    return data.value
  }
}

const subtaskService = new SubtaskService()
export default subtaskService
