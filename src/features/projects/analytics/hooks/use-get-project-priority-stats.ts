import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'
import type { ProjectPriorityStats } from '../types'

export interface GetProjectPriorityStatsParams {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}

export const useGetProjectPriorityStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: GetProjectPriorityStatsParams) => {
  const {
    data: priorityStats = getDefaultPaginationResponse<ProjectPriorityStats>(),
    isLoading: isLoadingPriorityStats
  } = useQuery({
    queryKey: queryKeys.projects.priorityStats({ projectIdentifier, parentMilestoneIdentifier }),
    queryFn: () => projectAnalyticService.getProjectPriorityStats({ projectIdentifier, parentMilestoneIdentifier })
  })

  return { priorityStats, isLoadingPriorityStats }
}
