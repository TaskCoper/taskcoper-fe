import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Subtask } from './types'
import type { AddTaskSubtaskFormValues } from './validations'

class TaskSubtaskService {
  private readonly baseUrl = 'tasks'

  getTaskSubtasks = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await api.get<BasePaginationResponse<Subtask>>(`/v1/${this.baseUrl}/${taskId}/subtasks`)

    return data
  }

  addTaskSubtask = async ({ body }: { body: AddTaskSubtaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/subtasks`, body)

    return data.value
  }
}

const taskSubtaskService = new TaskSubtaskService()
export default taskSubtaskService
