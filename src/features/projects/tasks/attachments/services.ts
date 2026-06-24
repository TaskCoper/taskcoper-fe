import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { Attachment } from './types'
import type { UpdateTaskAttachmentFormValues, UploadTaskAttachmentFormValues } from './validations'

class TaskAttachmentService extends BaseService {
  private readonly baseUrl = 'tasks'

  getTaskAttachments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await this.get<BasePaginationResponse<Attachment>>(`/v1/${this.baseUrl}/${taskId}/attachments`)

    return data
  }

  uploadTaskAttachment = async ({ body }: { body: UploadTaskAttachmentFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/attachments`, body)

    return data.value
  }

  updateTaskAttachment = async ({ body }: { body: UpdateTaskAttachmentFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.taskId}/attachments/${body.projectResourceId}`,
      body
    )

    return data.value
  }

  deleteTaskAttachment = async ({ id, taskId }: { id: string; taskId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/attachments/${id}`)

    return data.value
  }
}

const taskAttachmentService = new TaskAttachmentService()
export default taskAttachmentService
