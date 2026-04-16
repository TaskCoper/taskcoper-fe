import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectMember = ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
  const { data: projectMember, isLoading: isLoadingProjectMember } = useQuery({
    queryKey: queryKeys.projects.members.detail({ projectIdentifier, userId }),
    queryFn: () => projectService.getProjectMember({ projectIdentifier, userId }),
    enabled: Boolean(projectIdentifier && userId)
  })

  return { projectMember, isLoadingProjectMember }
}
