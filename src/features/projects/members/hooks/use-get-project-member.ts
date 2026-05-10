import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectMemberService from '../services'

export const useGetProjectMember = ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
  const { data: projectMember, isLoading: isLoadingProjectMember } = useQuery({
    queryKey: queryKeys.projects.members.detail({ projectIdentifier, userId }),
    queryFn: () => projectMemberService.getProjectMember({ projectIdentifier, userId }),
    enabled: Boolean(projectIdentifier && userId)
  })

  return { projectMember, isLoadingProjectMember }
}
