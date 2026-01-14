import type { AddTaskCommentFormValues } from '@/features/comments/validations'
import type { AddSubtaskFormValues } from '@/features/subtasks/validations'
import type { AddTaskFormValues, MoveTaskFormValues, UpdateTaskFormValues } from '@/features/tasks/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Comment } from '@/types/comment.type'
import type { Subtask } from '@/types/subtask.type'
import type { TaskDetail, TaskMember } from '@/types/task.type'

class TaskService {
  private readonly baseUrl = 'tasks'

  addTask = async ({ body }: { body: AddTaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  moveTask = async ({ body }: { body: MoveTaskFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}/move`, body)

    return data.value
  }

  getTask = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BaseResponse<TaskDetail>>(`/v1/${this.baseUrl}/${taskId}`)

    return data.value
  }

  deleteTask = async ({ taskId }: { taskId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}`, {
      data: {
        id: taskId
      }
    })

    return data.value
  }

  updateTask = async ({ body }: { body: UpdateTaskFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}`, body)

    return data.value
  }

  getComments = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Comment>>(`/v1/${this.baseUrl}/${taskId}/comments`)

    return data
  }

  addComment = async ({ body }: { body: AddTaskCommentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/comments`, body)

    return data.value
  }

  getSubtasks = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Subtask>>(`/v1/${this.baseUrl}/${taskId}/subtasks`)

    return data
  }

  addSubtask = async ({ body }: { body: AddSubtaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/subtasks`, body)

    return data.value
  }

  assignMember = async ({ taskId, userId }: { taskId: string; userId: string }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/members`, { userId, taskId })

    return data.value
  }

  unassignMember = async ({ id, userId }: { id: string; userId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/members`, {
      data: { id, userId }
    })

    return data.value
  }

  getTaskMembers = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<TaskMember>>(`/v1/${this.baseUrl}/${taskId}/members`)

    return data
  }
}

const taskService = new TaskService()
export default taskService
