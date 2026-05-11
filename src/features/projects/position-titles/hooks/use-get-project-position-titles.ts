import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectPositionTitleService from '../services'
import type { ProjectPositionTitle } from '../types'

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
    queryFn: () => projectPositionTitleService.getProjectPositionTitles({ projectIdentifier }),
    enabled: !!projectIdentifier && enabled
  })

  return { positionTitles, isLoadingPositionTitles }
}
