import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMember } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export interface UseGetProjectMembersParams {
  projectId?: string
  searchTerm?: string
}

// TODO: add pagination
export const useGetProjectMembers = ({ projectId, searchTerm }: UseGetProjectMembersParams) => {
  const {
    data: members = {
      ...getDefaultPaginationResponse<ProjectMember>()
    },
    isLoading: isLoadingMembers,
    error
  } = useQuery({
    queryKey: ['members', projectId, searchTerm],
    queryFn: () => projectService.getProjectMembers({ projectId, searchTerm }),
    enabled: !!projectId
  })

  return { members, isLoadingMembers, error }
}
