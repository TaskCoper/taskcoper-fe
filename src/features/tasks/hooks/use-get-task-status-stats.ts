import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskStatusStats } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export const useGetTaskStatusStats = ({
  projectId,
  parentMilestoneId
}: {
  projectId: string
  parentMilestoneId?: string
}) => {
  const {
    data: taskStatusStats = getDefaultPaginationResponse<TaskStatusStats>(),
    isLoading: isLoadingTaskStatusStats
  } = useQuery({
    queryKey: queryKeys.projects.taskStatusStats(projectId, parentMilestoneId),
    queryFn: () => projectService.getTaskStatusStats({ projectId, parentMilestoneId }),
    enabled: !!projectId
  })

  return { taskStatusStats, isLoadingTaskStatusStats }
}
