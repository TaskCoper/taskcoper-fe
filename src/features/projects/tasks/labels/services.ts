import { api, type BaseResponse } from '@/lib/axios'
import type { AddTaskLabelFormValues } from './validations'

class TaskLabelService {
  private readonly baseUrl = 'tasks'

  addTaskLabel = async ({ body }: { body: AddTaskLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/labels`, body)

    return data.value
  }

  deleteTaskLabel = async ({ id }: { id: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/labels/${id}`)

    return data.value
  }
}

const taskLabelService = new TaskLabelService()
export default taskLabelService
