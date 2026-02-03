import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskRow } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetTasksParams {
  enabled?: boolean
  parentMilestoneId?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: string
}

export const useGetTasks = ({
  parentMilestoneId,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy,
  enabled = true
}: UseGetTasksParams) => {
  const { data: tasks = getDefaultPaginationResponse<TaskRow>(), isLoading: isLoadingTasks } = useQuery({
    queryKey: queryKeys.tasks.list({ parentMilestoneId, pageIndex, pageSize, sortBy }),
    queryFn: () => taskService.getTasks({ parentMilestoneId, pageIndex, pageSize, sortBy }),
    enabled: enabled && !!parentMilestoneId
  })

  return { tasks, isLoadingTasks }
}
