import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'
import type { TaskStatusStats } from '../types'

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
    queryFn: () => projectAnalyticService.getTaskStatusStats({ projectIdentifier, parentMilestoneIdentifier }),
    enabled: !!projectIdentifier
  })

  return { taskStatusStats, isLoadingTaskStatusStats }
}
