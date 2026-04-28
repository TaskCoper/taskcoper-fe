import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectPriorityStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectPriorityStatsParams {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}

export const useGetProjectPriorityStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: UseGetProjectPriorityStatsParams) => {
  const {
    data: priorityStats = getDefaultPaginationResponse<ProjectPriorityStats>(),
    isLoading: isLoadingPriorityStats
  } = useQuery({
    queryKey: queryKeys.projects.priorityStats(projectIdentifier, parentMilestoneIdentifier),
    queryFn: () => projectService.getProjectPriorityStats({ projectIdentifier, parentMilestoneIdentifier })
  })

  return { priorityStats, isLoadingPriorityStats }
}
