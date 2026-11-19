import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectMemberService from '../services'

export interface GetProjectMembersPerformanceParams {
  projectIdentifier?: string
  from?: string
  to?: string
}

export const useGetProjectMembersPerformance = ({
  projectIdentifier,
  from,
  to
}: GetProjectMembersPerformanceParams) => {
  const { data: membersPerformance = [], isLoading: isLoadingMembersPerformance } = useQuery({
    queryKey: queryKeys.projects.members.performanceAll({ projectIdentifier, from, to }),
    queryFn: () => projectMemberService.getProjectMembersPerformance({ projectIdentifier, from, to }),
    enabled: !!projectIdentifier && !!from && !!to
  })

  return { membersPerformance, isLoadingMembersPerformance }
}
