import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectPositionTitleService from '../services'
import type { ProjectMemberPositionTitle } from '../types'

export const useGetProjectMemberPositionTitles = ({
  projectIdentifier,
  userId
}: {
  projectIdentifier?: string
  userId?: string
}) => {
  const {
    data: positionTitles = getDefaultPaginationResponse<ProjectMemberPositionTitle>(),
    isLoading: isLoadingProjectMemberPositionTitles
  } = useQuery({
    queryKey: queryKeys.projects.positionTitles.member(projectIdentifier, userId),
    queryFn: () => projectPositionTitleService.getProjectMemberPositionTitles({ projectIdentifier, userId }),
    enabled: Boolean(projectIdentifier && userId)
  })

  return { positionTitles, isLoadingProjectMemberPositionTitles }
}
