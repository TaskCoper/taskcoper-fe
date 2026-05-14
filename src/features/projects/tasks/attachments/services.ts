import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Attachment } from './types'
import type { UpdateTaskAttachmentFormValues, UploadTaskAttachmentFormValues } from './validations'

class TaskAttachmentService {
  private readonly baseUrl = 'tasks'

  getTaskAttachments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Attachment>>(`/v1/${this.baseUrl}/${taskId}/attachments`)

    return data
  }

  uploadTaskAttachment = async ({ body }: { body: UploadTaskAttachmentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/attachments`, body)

    return data.value
  }

  updateTaskAttachment = async ({ body }: { body: UpdateTaskAttachmentFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.taskId}/attachments/${body.projectResourceId}`,
      body
    )

    return data.value
  }

  deleteTaskAttachment = async ({ id, taskId }: { id: string; taskId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/attachments/${id}`)

    return data.value
  }
}

const taskAttachmentService = new TaskAttachmentService()
export default taskAttachmentService
