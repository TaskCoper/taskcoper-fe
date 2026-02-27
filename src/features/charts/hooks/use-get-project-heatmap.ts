import { queryKeys } from '@/lib/query-keys'
import efficiencyService from '@/services/efficiency.service'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export interface GetProjectHeatmapParams {
  projectId?: string
  from: string
  to: string
}

const FIVE_MINUTES = 5 * 60 * 1000

export const useGetProjectHeatmap = ({ projectId, from, to }: GetProjectHeatmapParams) => {
  const { data: projectActivityStats, isLoading: isLoadingProjectActivityStats } = useQuery({
    queryKey: queryKeys.efficiency.heatmap({ projectId, from, to }),
    queryFn: () => efficiencyService.getProjectHeatmap({ projectId, from, to }),
    enabled: !!projectId && !!from && !!to,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData
  })

  return { projectActivityStats, isLoadingProjectActivityStats }
}
