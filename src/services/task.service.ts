import type { AddTaskFormValues } from '@/features/tasks/validations'
import api, { type BaseResponse } from '@/lib/axios'

class TaskService {
  private readonly baseUrl = 'tasks'

  addTask = async ({ body }: { body: AddTaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }
}

const taskService = new TaskService()
export default taskService
