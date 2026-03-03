import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectPriorityStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectPriorityStatsParams {
  projectId: string
  parentMilestoneId?: string
}

export const useGetProjectPriorityStats = ({ projectId, parentMilestoneId }: UseGetProjectPriorityStatsParams) => {
  const {
    data: priorityStats = getDefaultPaginationResponse<ProjectPriorityStats>(),
    isLoading: isLoadingPriorityStats
  } = useQuery({
    queryKey: queryKeys.projects.priorityStats(projectId, parentMilestoneId),
    queryFn: () => projectService.getProjectPriorityStats({ projectId, parentMilestoneId })
  })

  return { priorityStats, isLoadingPriorityStats }
}
