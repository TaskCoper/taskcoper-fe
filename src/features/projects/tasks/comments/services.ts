import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { Comment } from './types'
import type { AddTaskCommentFormValues, UpdateTaskCommentFormValues } from './validations'

class TaskCommentService extends BaseService {
  private readonly baseUrl = 'tasks'

  getTaskComments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await this.get<BasePaginationResponse<Comment>>(`/v1/${this.baseUrl}/${taskId}/comments`)

    return data
  }

  addTaskComment = async ({ body }: { body: AddTaskCommentFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/comments`, body)

    return data.value
  }

  updateTaskComment = async ({ body }: { body: UpdateTaskCommentFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.taskId}/comments/${body.commentId}`,
      body
    )

    return data.value
  }

  deleteTaskComment = async ({ commentId, taskId }: { commentId: string; taskId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/comments/${commentId}`)

    return data.value
  }
}

const taskCommentService = new TaskCommentService()
export default taskCommentService
