import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { Subtask } from '../../subtasks/shared-types'
import type { AddTaskSubtaskFormValues } from './validations'

class TaskSubtaskService extends BaseService {
  private readonly baseUrl = 'tasks'

  getTaskSubtasks = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await this.get<BasePaginationResponse<Subtask>>(`/v1/${this.baseUrl}/${taskId}/subtasks`)

    return data
  }

  addTaskSubtask = async ({ body }: { body: AddTaskSubtaskFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/subtasks`, body)

    return data.value
  }
}

const taskSubtaskService = new TaskSubtaskService()
export default taskSubtaskService
