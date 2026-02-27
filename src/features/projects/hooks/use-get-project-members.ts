import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMember } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectMembersParams {
  projectId?: string
  searchTerm?: string
  enabled?: boolean
}

// TODO: add pagination
export const useGetProjectMembers = ({ projectId, searchTerm, enabled = true }: UseGetProjectMembersParams) => {
  const {
    data: members = getDefaultPaginationResponse<ProjectMember>(),
    isLoading: isLoadingMembers,
    error
  } = useQuery({
    queryKey: queryKeys.projects.members.list(projectId, searchTerm),
    queryFn: () => projectService.getProjectMembers({ projectId, searchTerm }),
    enabled: !!projectId && !!enabled
  })

  return { members, isLoadingMembers, error }
}
