import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectMemberService from '../services'
import type { ProjectMemberRequest } from '../types'

export interface GetProjectMemberRequestsParams {
  projectIdentifier?: string
  isInviteUser: boolean
  // true for invite user, false for request user
  pageIndex?: number
  pageSize?: number
  searchTerm?: string
}

export const useGetProjectMemberRequests = ({
  isInviteUser,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  projectIdentifier,
  searchTerm
}: GetProjectMemberRequestsParams) => {
  const {
    data: memberRequest = getDefaultPaginationResponse<ProjectMemberRequest>(),
    isLoading: isLoadingMemberRequests
  } = useQuery({
    queryKey: queryKeys.projects.members.requests({
      isInviteUser,
      pageIndex,
      pageSize,
      projectIdentifier,
      searchTerm
    }),
    queryFn: () =>
      projectMemberService.getProjectMemberRequests({
        isInviteUser,
        pageIndex,
        pageSize,
        projectIdentifier,
        searchTerm
      }),
    enabled: !!projectIdentifier
  })

  return { memberRequest, isLoadingMemberRequests }
}
