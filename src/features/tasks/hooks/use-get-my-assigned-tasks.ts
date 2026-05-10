import { queryKeys } from '@/lib/query-keys'

import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskPreview } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMyAssignedTasksParams {
  projectIdentifier?: string
  userId?: string
  enabled?: boolean
}

export const useGetMyAssignedTasks = ({ projectIdentifier, userId, enabled = true }: GetMyAssignedTasksParams) => {
  const {
    data: assignedTasks = getDefaultPaginationResponse<TaskPreview>(),
    isLoading: isLoadingAssignedTasks,
    error
  } = useQuery({
    queryKey: queryKeys.tasks.myAssigned(projectIdentifier, userId),
    queryFn: () => projectService.getMyAssignedTasks({ projectIdentifier, userId }),
    enabled: !!projectIdentifier && !!userId && enabled
  })

  return { assignedTasks, isLoadingAssignedTasks, error }
}
