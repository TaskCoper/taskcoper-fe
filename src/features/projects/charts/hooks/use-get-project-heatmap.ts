import { queryKeys } from '@/lib/query-keys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import efficiencyService from '../services'

export interface GetProjectHeatmapParams {
  projectId?: string
  from: string
  to: string
}

const FIVE_MINUTES = 5 * 60 * 1000

export const useGetProjectHeatmap = ({ projectId, from, to }: GetProjectHeatmapParams) => {
  const { data: projectActivityStats, isLoading: isLoadingProjectActivityStats } = useQuery({
    queryKey: queryKeys.projects.efficiency.heatmap({ projectId, from, to }),
    queryFn: () => efficiencyService.getProjectHeatmap({ projectId, from, to }),
    enabled: !!projectId && !!from && !!to,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData
  })

  return { projectActivityStats, isLoadingProjectActivityStats }
}
