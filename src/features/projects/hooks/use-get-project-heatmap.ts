import { queryKeys } from '@/lib/query-keys'
import efficiencyService from '@/services/efficiency.service'
import { useQuery } from '@tanstack/react-query'

export interface GetProjectHeatmapParams {
  projectId?: string
  from: string
  to: string
}

export const useGetProjectHeatmap = ({ projectId, from, to }: GetProjectHeatmapParams) => {
  const { data: projectActivityStats, isLoading: isLoadingProjectActivityStats } = useQuery({
    queryKey: queryKeys.efficiency.heatmap({ projectId, from, to }),
    queryFn: () => efficiencyService.getProjectActivityStats({ projectId, from, to }),
    enabled: !!projectId && !!from && !!to
  })

  return { projectActivityStats, isLoadingProjectActivityStats }
}
