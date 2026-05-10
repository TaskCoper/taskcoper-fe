import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMemberPositionTitle } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'
import projectPositionTitleService from '../services'

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
