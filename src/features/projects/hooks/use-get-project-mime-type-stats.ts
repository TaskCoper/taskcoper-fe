import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMimeTypeStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectMimeTypeStats = ({ projectId }: { projectId?: string }) => {
  const {
    data: projectMimeTypeStats = getDefaultPaginationResponse<ProjectMimeTypeStats>(),
    isLoading: isLoadingProjectMimeTypeStats
  } = useQuery({
    queryKey: queryKeys.projects.mimeTypeStats(projectId),
    queryFn: () => projectService.getProjectMimeTypeStats({ projectId }),
    enabled: !!projectId
  })

  return { projectMimeTypeStats, isLoadingProjectMimeTypeStats }
}
