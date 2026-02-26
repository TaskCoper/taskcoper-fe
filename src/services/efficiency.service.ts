import type { GetProjectTaskStatsParams } from '@/features/charts/hooks/use-get-project-task-stats'
import type { GetProjectHeatmapParams } from '@/features/projects/hooks/use-get-project-heatmap'
import api, { type BaseResponse } from '@/lib/axios'
import type { ProjectHeatmap, ProjectTaskStats } from '@/types/efficiency.type'

class EfficiencyService {
  private readonly baseUrl = 'efficiency'

  getProjectHeatmap = async ({ projectId, from, to }: GetProjectHeatmapParams) => {
    if (!projectId) return null
    const { data } = await api.get<BaseResponse<ProjectHeatmap[]>>(`/v1/${this.baseUrl}/${projectId}/heatmap`, {
      params: {
        from,
        to
      }
    })

    return data.value
  }

  getProjectTaskStats = async ({
    projectId,
    from,
    to,
    parentMilestoneId,
    isViewInMonth
  }: GetProjectTaskStatsParams) => {
    const { data } = await api.get<BaseResponse<ProjectTaskStats[]>>(
      `/v1/${this.baseUrl}/${projectId}/statistics/tasks`,
      {
        params: {
          from,
          to,
          parentMilestoneId,
          isViewInMonth
        }
      }
    )

    return data.value
  }
}

const efficiencyService = new EfficiencyService()
export default efficiencyService
