import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMember } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectMembers = ({ projectId }: { projectId?: string }) => {
  const {
    data: members = {
      ...getDefaultPaginationResponse<ProjectMember>()
    },
    isLoading: isLoadingMembers,
    error
  } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectService.getProjectMembers({ projectId }),
    enabled: !!projectId
  })

  return { members, isLoadingMembers, error }
}
