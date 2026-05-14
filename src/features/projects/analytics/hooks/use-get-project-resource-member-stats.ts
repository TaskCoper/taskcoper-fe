import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'
import type { ProjectResourceMemberStats } from '../types'

export const useGetProjectResourceMemberStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const {
    data: projectResourceMemberStats = getDefaultPaginationResponse<ProjectResourceMemberStats>(),
    isLoading: isLoadingProjectResourceMemberStats
  } = useQuery({
    queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier),
    queryFn: () => projectAnalyticService.getProjectResourceMemberStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectResourceMemberStats, isLoadingProjectResourceMemberStats }
}
