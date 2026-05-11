import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import type { ProjectMember } from '../../core/types'
import projectMemberService from '../services'

export interface GetProjectMembersParams {
  identifier?: string
  searchTerm?: string
  enabled?: boolean
  pageIndex?: number
  pageSize?: number
  excludeIds?: string[]
}

export const useGetProjectMembers = ({
  identifier,
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
  excludeIds
}: GetProjectMembersParams) => {
  const { data: members = getDefaultPaginationResponse<ProjectMember>(), isLoading: isLoadingMembers } = useQuery({
    queryKey: queryKeys.projects.members.list({ identifier, searchTerm, pageIndex, pageSize, excludeIds }),
    queryFn: () => projectMemberService.getProjectMembers({ identifier, searchTerm, pageIndex, pageSize, excludeIds }),
    enabled: !!identifier && !!enabled
  })

  return { members, isLoadingMembers }
}
