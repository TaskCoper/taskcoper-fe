import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import efficiencyService from '../services'

export interface GetProjectTopContributorsParams {
  projectId?: string
  from: string
  to: string
}

export const useGetProjectTopContributors = ({ projectId, from, to }: GetProjectTopContributorsParams) => {
  const { data: projectTopContributors, isLoading: isLoadingProjectTopContributors } = useQuery({
    queryKey: queryKeys.efficiency.topContributors({ projectId, from, to }),
    queryFn: () => efficiencyService.getTopContributors({ projectId, from, to }),
    enabled: !!projectId
  })

  return { projectTopContributors, isLoadingProjectTopContributors }
}
