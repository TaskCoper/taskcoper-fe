import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskRow } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetTasksParams {
  enabled?: boolean
  parentMilestoneIdentifier?: string
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
  isWatchingTask?: boolean
  projectIdentifier?: string
}

export const useGetTasks = ({
  parentMilestoneIdentifier,
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
  isWatchingTask,
  projectIdentifier,
  enabled = true
}: UseGetTasksParams) => {
  const { data: tasks = getDefaultPaginationResponse<TaskRow>(), isLoading: isLoadingTasks } = useQuery({
    queryKey: queryKeys.tasks.list({
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
      projectIdentifier,
      isWatchingTask
    }),
    queryFn: () =>
      taskService.getTasks({
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
        projectIdentifier,
        isWatchingTask
      }),
    enabled
  })

  return { tasks, isLoadingTasks }
}
