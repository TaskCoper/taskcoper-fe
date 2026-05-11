import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Comment } from './types'
import type { AddTaskCommentFormValues, UpdateTaskCommentFormValues } from './validations'

class TaskCommentService {
  private readonly baseUrl = 'tasks'

  getTaskComments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Comment>>(`/v1/${this.baseUrl}/${taskId}/comments`)

    return data
  }

  addTaskComment = async ({ body }: { body: AddTaskCommentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/comments`, body)

    return data.value
  }

  updateTaskComment = async ({ body }: { body: UpdateTaskCommentFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.taskId}/comments/${body.commentId}`,
      body
    )

    return data.value
  }

  deleteTaskComment = async ({ commentId, taskId }: { commentId: string; taskId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/comments/${commentId}`)

    return data.value
  }
}

const taskCommentService = new TaskCommentService()
export default taskCommentService
