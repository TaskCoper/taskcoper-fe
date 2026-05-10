import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'
import type { ProjectMemberStats } from '../types'

export const useGetProjectMemberStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}) => {
  const {
    data: projectMemberStats = getDefaultPaginationResponse<ProjectMemberStats>(),
    isLoading: isLoadingProjectMemberStats
  } = useQuery({
    queryKey: queryKeys.projects.memberStats(projectIdentifier, parentMilestoneIdentifier),
    queryFn: () => projectAnalyticService.getProjectMemberStats({ projectIdentifier, parentMilestoneIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectMemberStats, isLoadingProjectMemberStats }
}
