import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import type { TaskMember } from './types'

class TaskMemberService extends BaseService {
  private readonly baseUrl = 'tasks'

  assignTaskMember = async ({ taskId, userId }: { taskId: string; userId: string }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/members`, { userId, taskId })

    return data.value
  }

  unassignTaskMember = async ({ id, userId }: { id: string; userId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/members`, {
      data: { id, userId }
    })

    return data.value
  }

  getTaskMembers = async ({ taskId }: { taskId?: string }) => {
    if (!taskId) return null
    const { data } = await this.get<BasePaginationResponse<TaskMember>>(`/v1/${this.baseUrl}/${taskId}/members`)

    return data
  }
}

const taskMemberService = new TaskMemberService()
export default taskMemberService
