import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import efficiencyService from '../services'

export interface GetProjectOnTimeCompletersParams {
  projectId?: string
  from: string
  to: string
}

export const useGetProjectOnTimeCompleters = ({ projectId, from, to }: GetProjectOnTimeCompletersParams) => {
  const { data: projectOnTimeCompleters, isLoading: isLoadingProjectOnTimeCompleters } = useQuery({
    queryKey: queryKeys.projects.efficiency.onTimeCompleters({ projectId, from, to }),
    queryFn: () => efficiencyService.getOnTimeCompleters({ projectId, from, to }),
    enabled: !!projectId
  })

  return { projectOnTimeCompleters, isLoadingProjectOnTimeCompleters }
}
