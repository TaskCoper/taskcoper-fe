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
  labelIds?: string[]
  milestoneIds?: string[]
  endDate?: string[]
  startDate?: string[]
  isCompleted?: boolean
  name?: string
  memberIds?: string[]
  priorities?: (string | null)[]
}

export const useGetTasks = ({
  parentMilestoneId,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy,
  labelIds,
  milestoneIds,
  endDate,
  startDate,
  isCompleted,
  name,
  memberIds,
  priorities,
  enabled = true
}: UseGetTasksParams) => {
  const { data: tasks = getDefaultPaginationResponse<TaskRow>(), isLoading: isLoadingTasks } = useQuery({
    queryKey: queryKeys.tasks.list({
      parentMilestoneId,
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
      priorities
    }),
    queryFn: () =>
      taskService.getTasks({
        parentMilestoneId,
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
        priorities
      }),
    enabled: enabled && !!parentMilestoneId
  })

  return { tasks, isLoadingTasks }
}
