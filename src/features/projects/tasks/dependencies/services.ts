import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { DependencyTask, TaskDependencies } from './types'

export const taskDependencyService = {
  get: async (taskId: string, signal?: AbortSignal) => {
    const { data } = await api.get<BaseResponse<TaskDependencies>>(`/v1/tasks/${taskId}/dependencies`, { signal })
    return data.value
  },
  candidates: async (taskId: string, searchTerm: string, pageIndex: number, signal?: AbortSignal) => {
    const { data } = await api.get<BasePaginationResponse<DependencyTask>>(
      `/v1/tasks/${taskId}/dependency-candidates`,
      {
        params: { searchTerm, pageIndex, pageSize: 20 },
        signal
      }
    )
    return data.value
  },
  update: async ({ taskId, prerequisiteId, remove }: { taskId: string; prerequisiteId: string; remove: boolean }) => {
    const path = `/v1/tasks/${taskId}/dependencies/${prerequisiteId}`
    if (remove) await api.delete(path)
    else await api.put(path)
  }
}
