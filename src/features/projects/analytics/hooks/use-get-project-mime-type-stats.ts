import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAnalyticService from '../services'
import type { ProjectMimeTypeStats } from '../types'

export const useGetProjectMimeTypeStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const {
    data: projectMimeTypeStats = getDefaultPaginationResponse<ProjectMimeTypeStats>(),
    isLoading: isLoadingProjectMimeTypeStats
  } = useQuery({
    queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier),
    queryFn: () => projectAnalyticService.getProjectMimeTypeStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectMimeTypeStats, isLoadingProjectMimeTypeStats }
}
