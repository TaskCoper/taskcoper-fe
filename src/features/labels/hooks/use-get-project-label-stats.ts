import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectLabelStats } from '@/types/label.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectLabelStatsParams {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}

export const useGetProjectLabelStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: UseGetProjectLabelStatsParams) => {
  const { data: labelStats = getDefaultPaginationResponse<ProjectLabelStats>(), isLoading: isLoadingLabelStats } =
    useQuery({
      queryKey: queryKeys.projects.labelStats(projectIdentifier, parentMilestoneIdentifier),
      queryFn: () => projectService.getProjectLabelStats({ projectIdentifier, parentMilestoneIdentifier })
    })

  return { labelStats, isLoadingLabelStats }
}
