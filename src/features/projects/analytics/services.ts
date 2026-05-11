import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { GetProjectLabelStatsParams } from './hooks/use-get-project-label-stats'
import type { GetProjectPriorityStatsParams } from './hooks/use-get-project-priority-stats'
import type {
  ProjectLabelStats,
  ProjectMemberStats,
  ProjectMimeTypeStats,
  ProjectPriorityStats,
  ProjectResourceMemberStats,
  ProjectResourceStats,
  RevenueLabelStats,
  RevenueStats,
  RevenueTypeStats,
  TaskStatusStats
} from './types'

class ProjectAnalyticService {
  private readonly baseUrl = 'projects'

  getProjectLabelStats = async ({ projectIdentifier, parentMilestoneIdentifier }: GetProjectLabelStatsParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectLabelStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/task-labels/statistic`,
      {
        params: {
          parentMilestoneIdentifier
        }
      }
    )

    return data
  }

  getTaskStatusStats = async ({ projectIdentifier, parentMilestoneIdentifier }: GetProjectLabelStatsParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<TaskStatusStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/tasks-status/statistic`,
      {
        params: {
          parentMilestoneIdentifier
        }
      }
    )

    return data
  }

  getProjectMemberStats = async ({ projectIdentifier, parentMilestoneIdentifier }: GetProjectLabelStatsParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectMemberStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members-tasks/statistic`,
      {
        params: {
          parentMilestoneIdentifier
        }
      }
    )

    return data
  }

  getProjectResourceStats = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BaseResponse<ProjectResourceStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources/statistic`
    )

    return data.value
  }

  getProjectMimeTypeStats = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectMimeTypeStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources/mime-types/statistic`
    )

    return data
  }

  getProjectResourceMemberStats = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectResourceMemberStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources/members/statistic`
    )

    return data
  }

  getProjectPriorityStats = async ({ projectIdentifier, parentMilestoneIdentifier }: GetProjectPriorityStatsParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectPriorityStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/tasks-priority/statistic`,
      {
        params: {
          parentMilestoneIdentifier
        }
      }
    )

    return data
  }

  getProjectRevenueStats = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BaseResponse<RevenueStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/health-check`
    )

    return data.value
  }

  getProjectRevenueLabelStats = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<RevenueLabelStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/statistics/labels`
    )

    return data.value.items
  }

  getProjectRevenueTypeStats = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<RevenueTypeStats>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/statistics/types`
    )

    return data.value.items
  }
}

const projectAnalyticService = new ProjectAnalyticService()
export default projectAnalyticService
