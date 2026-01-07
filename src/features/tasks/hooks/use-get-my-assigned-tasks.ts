import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskPreview } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export interface GetMyAssignedTasksParams {
  projectId?: string
  userId?: string
  enabled?: boolean
}

export const useGetMyAssignedTasks = ({ projectId, userId, enabled = true }: GetMyAssignedTasksParams) => {
  const {
    data: assignedTasks = {
      ...getDefaultPaginationResponse<TaskPreview>()
    },
    isLoading: isLoadingAssignedTasks,
    error
  } = useQuery({
    queryKey: ['my-assigned-tasks', projectId, userId],
    queryFn: () => projectService.getMyAssignedTasks({ projectId, userId }),
    enabled: !!projectId && !!userId && enabled
  })

  return { assignedTasks, isLoadingAssignedTasks, error }
}
