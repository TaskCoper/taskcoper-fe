import api, { type BaseResponse } from '@/lib/axios'
import type { GetProjectHeatmapParams } from './hooks/use-get-project-heatmap'
import type { GetProjectOnTimeCompletersParams } from './hooks/use-get-project-on-time-completers'
import type { GetProjectTaskStatsParams } from './hooks/use-get-project-task-stats'
import type { GetProjectTopContributorsParams } from './hooks/use-get-project-top-contributors'
import type { ProjectHeatmap, ProjectTaskStats, ProjectTopContributor } from './types'

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
    isViewInMonth,
    userId
  }: GetProjectTaskStatsParams) => {
    const { data } = await api.get<BaseResponse<ProjectTaskStats[]>>(
      `/v1/${this.baseUrl}/${projectId}/statistics/tasks`,
      {
        params: {
          from,
          to,
          parentMilestoneId,
          isViewInMonth,
          userId
        }
      }
    )

    return data.value
  }

  getTopContributors = async ({ projectId, from, to }: GetProjectTopContributorsParams) => {
    if (!projectId) return null
    const { data } = await api.get<BaseResponse<ProjectTopContributor[]>>(
      `/v1/${this.baseUrl}/${projectId}/top-contributors`,
      {
        params: {
          from,
          to
        }
      }
    )

    return data.value
  }

  getOnTimeCompleters = async ({ projectId, from, to }: GetProjectOnTimeCompletersParams) => {
    if (!projectId) return null
    const { data } = await api.get<BaseResponse<ProjectTopContributor[]>>(
      `/v1/${this.baseUrl}/${projectId}/top-contributors/on-deadline`,
      {
        params: {
          from,
          to
        }
      }
    )

    return data.value
  }
}

const efficiencyService = new EfficiencyService()
export default efficiencyService
