import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'
import type { ProjectLabelStats } from '../types'

export interface GetProjectLabelStatsParams {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}

export const useGetProjectLabelStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: GetProjectLabelStatsParams) => {
  const { data: labelStats = getDefaultPaginationResponse<ProjectLabelStats>(), isLoading: isLoadingLabelStats } =
    useQuery({
      queryKey: queryKeys.projects.labelStats({ projectIdentifier, parentMilestoneIdentifier }),
      queryFn: () => projectAnalyticService.getProjectLabelStats({ projectIdentifier, parentMilestoneIdentifier })
    })

  return { labelStats, isLoadingLabelStats }
}
