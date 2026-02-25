import type { GetProjectHeatmapParams } from '@/features/projects/hooks/use-get-project-heatmap'
import api, { type BaseResponse } from '@/lib/axios'
import type { ProjectHeatmap } from '@/types/efficiency.type'

class EfficiencyService {
  private readonly baseUrl = 'efficiency'

  getProjectActivityStats = async ({ projectId, from, to }: GetProjectHeatmapParams) => {
    if (!projectId) return null
    const { data } = await api.get<BaseResponse<ProjectHeatmap[]>>(`/v1/${this.baseUrl}/${projectId}/heatmap`, {
      params: {
        from,
        to
      }
    })

    return data.value
  }
}

const efficiencyService = new EfficiencyService()
export default efficiencyService
