import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMember } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectMembersParams {
  projectId?: string
  searchTerm?: string
  enabled?: boolean
  pageIndex?: number
  pageSize?: number
  excludeIds?: string[]
}

export const useGetProjectMembers = ({
  projectId,
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
  excludeIds
}: UseGetProjectMembersParams) => {
  const {
    data: members = getDefaultPaginationResponse<ProjectMember>(),
    isLoading: isLoadingMembers,
    error
  } = useQuery({
    queryKey: queryKeys.projects.members.list({ projectId, searchTerm, pageIndex, pageSize, excludeIds }),
    queryFn: () => projectService.getProjectMembers({ projectId, searchTerm, pageIndex, pageSize, excludeIds }),
    enabled: !!projectId && !!enabled
  })

  return { members, isLoadingMembers, error }
}
