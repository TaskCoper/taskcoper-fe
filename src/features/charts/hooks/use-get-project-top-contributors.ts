import { queryKeys } from '@/lib/query-keys'
import efficiencyService from '@/services/efficiency.service'
import { useQuery } from '@tanstack/react-query'

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
