import api, { type BaseResponse } from '@/lib/axios'
import type {
  AssignMemberToSubtaskFormValues,
  UpdateSubtaskFormValues,
  UpdateSubtaskStatusFormValues
} from './validations'

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

  assignSubtaskMember = async ({ body }: { body: AssignMemberToSubtaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.subtaskId}/members`, body)

    return data.value
  }

  unassignSubtaskMember = async ({ body }: { body: AssignMemberToSubtaskFormValues }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.subtaskId}/members`, {
      data: body
    })

    return data.value
  }

  convertToTask = async ({ subtaskId }: { subtaskId: string }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${subtaskId}/convert-to-task`)

    return data.value
  }
}

const subtaskService = new SubtaskService()
export default subtaskService
