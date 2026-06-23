import type { BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { AddTaskLabelFormValues } from './validations'

class TaskLabelService extends BaseService {
  private readonly baseUrl = 'tasks'

  addTaskLabel = async ({ body }: { body: AddTaskLabelFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.taskId}/labels`, body)

    return data.value
  }

  deleteTaskLabel = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/labels/${id}`)

    return data.value
  }
}

const taskLabelService = new TaskLabelService()
export default taskLabelService
