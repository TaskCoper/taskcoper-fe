import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { TaskStatusStats } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'

export const useGetTaskStatusStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}) => {
  const {
    data: taskStatusStats = getDefaultPaginationResponse<TaskStatusStats>(),
    isLoading: isLoadingTaskStatusStats
  } = useQuery({
    queryKey: queryKeys.projects.taskStatusStats(projectIdentifier, parentMilestoneIdentifier),
    queryFn: () => projectService.getTaskStatusStats({ projectIdentifier, parentMilestoneIdentifier }),
    enabled: !!projectIdentifier
  })

  return { taskStatusStats, isLoadingTaskStatusStats }
}
