import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectPositionTitle } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectPositionTitles = ({
  projectIdentifier,
  enabled = true
}: {
  projectIdentifier?: string
  enabled?: boolean
}) => {
  const {
    data: positionTitles = getDefaultPaginationResponse<ProjectPositionTitle>(),
    isLoading: isLoadingPositionTitles
  } = useQuery({
    queryKey: queryKeys.projects.positionTitles.list(projectIdentifier),
    queryFn: () => projectService.getProjectPositionTitles({ projectIdentifier }),
    enabled: !!projectIdentifier && enabled
  })

  return { positionTitles, isLoadingPositionTitles }
}
