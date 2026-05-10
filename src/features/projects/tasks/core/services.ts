import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetTasksParams } from './hooks/use-get-tasks'
import type { TaskDetail, TaskRow } from './types'
import type { AddTaskFormValues, MoveTaskFormValues, UpdateTaskFormValues } from './validations'

class TaskService {
  private readonly baseUrl = 'tasks'

  // for table view
  getTasks = async ({
    parentMilestoneIdentifier,
    pageIndex,
    pageSize,
    sortBy,
    labelIds,
    milestoneIds,
    endDate,
    startDate,
    isCompleted,
    name,
    memberIds,
    priorities,
    isWatchingTask,
    projectIdentifier
  }: GetTasksParams) => {
    const { data } = await api.get<BasePaginationResponse<TaskRow>>(`/v1/${this.baseUrl}`, {
      params: {
        parentMilestoneIdentifier,
        pageIndex,
        pageSize,
        sortBy,
        labelIds,
        milestoneIds,
        endDateFrom: endDate?.[0],
        endDateTo: endDate?.[1],
        startDateFrom: startDate?.[0],
        startDateTo: startDate?.[1],
        isCompleted,
        searchTerm: name,
        memberIds,
        priorities,
        isWatching: isWatchingTask,
        projectIdentifier
      }
    })

    return data
  }

  getTask = async ({ taskIdentifier }: { taskIdentifier?: string }) => {
    if (!taskIdentifier) return null
    const { data } = await api.get<BaseResponse<TaskDetail>>(`/v1/${this.baseUrl}/${taskIdentifier}`)

    return data.value
  }

  addTask = async ({ body }: { body: AddTaskFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  moveTask = async ({ body }: { body: MoveTaskFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.id}/move`, body)

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

  updateTaskStatus = async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/mark`, { id, isCompleted })

    return data.value
  }

  toggleWatchTask = async ({ taskId, isWatching }: { taskId: string; isWatching: boolean }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${taskId}/watch`, {
      id: taskId,
      isWatching
    })

    return data.value
  }
}

const taskService = new TaskService()
export default taskService
