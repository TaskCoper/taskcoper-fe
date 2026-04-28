import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectResourceMemberStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectResourceMemberStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const {
    data: projectResourceMemberStats = getDefaultPaginationResponse<ProjectResourceMemberStats>(),
    isLoading: isLoadingProjectResourceMemberStats
  } = useQuery({
    queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier),
    queryFn: () => projectService.getProjectResourceMemberStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectResourceMemberStats, isLoadingProjectResourceMemberStats }
}
