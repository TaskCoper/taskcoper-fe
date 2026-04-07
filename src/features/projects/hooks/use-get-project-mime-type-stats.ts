import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMimeTypeStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectMimeTypeStats = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const {
    data: projectMimeTypeStats = getDefaultPaginationResponse<ProjectMimeTypeStats>(),
    isLoading: isLoadingProjectMimeTypeStats
  } = useQuery({
    queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier),
    queryFn: () => projectService.getProjectMimeTypeStats({ projectIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectMimeTypeStats, isLoadingProjectMimeTypeStats }
}
