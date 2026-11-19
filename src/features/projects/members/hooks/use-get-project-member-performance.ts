import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectMemberService from '../services'

export interface GetProjectMemberPerformanceParams {
  projectIdentifier?: string
  userId?: string
  from?: string
  to?: string
}

export const useGetProjectMemberPerformance = ({
  projectIdentifier,
  userId,
  from,
  to
}: GetProjectMemberPerformanceParams) => {
  const { data: memberPerformance = null, isLoading: isLoadingMemberPerformance } = useQuery({
    queryKey: queryKeys.projects.members.performance({ projectIdentifier, userId, from, to }),
    queryFn: () => projectMemberService.getProjectMemberPerformance({ projectIdentifier, userId, from, to }),
    enabled: !!projectIdentifier && !!userId && !!from && !!to
  })

  return { memberPerformance, isLoadingMemberPerformance }
}
