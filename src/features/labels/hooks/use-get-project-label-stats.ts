import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectLabelStats } from '@/types/label.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectLabelStatsParams {
  projectId: string
  parentMilestoneId?: string
}

export const useGetProjectLabelStats = ({ projectId, parentMilestoneId }: UseGetProjectLabelStatsParams) => {
  const { data: labelStats = getDefaultPaginationResponse<ProjectLabelStats>(), isLoading: isLoadingLabelStats } =
    useQuery({
      queryKey: queryKeys.projects.labelStats(projectId, parentMilestoneId),
      queryFn: () => projectService.getProjectLabelStats({ projectId, parentMilestoneId })
    })

  return { labelStats, isLoadingLabelStats }
}
