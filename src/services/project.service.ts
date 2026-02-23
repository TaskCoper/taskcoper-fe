import type { UseGetProjectLabelStatsParams } from '@/features/labels/hooks/use-get-project-label-stats'
import type { UseGetProjectPriorityStatsParams } from '@/features/labels/hooks/use-get-project-priority-stats'
import type { AddProjectLabelFormValues, UpdateProjectLabelFormValues } from '@/features/labels/validations'
import type { GetMilestonesParams } from '@/features/milestones/hooks/use-get-milestones'
import type { GetMyProjectsParams } from '@/features/projects/hooks/use-get-my-projects'
import type { UseGetProjectMembersParams } from '@/features/projects/hooks/use-get-project-members'
import type { UseGetProjectResourcesParams } from '@/features/projects/hooks/use-get-project-resources'
import type { GetProjectsParams } from '@/features/projects/hooks/use-get-projects'
import type { CreateProjectFormValues, UpdateProjectFormValues } from '@/features/projects/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { Label, ProjectLabelStats } from '@/types/label.type'
import type { MilestoneWithTasks, ParentMilestone } from '@/types/milestone.type'
import type {
  InviteMembersPayload,
  Project,
  ProjectMember,
  ProjectMemberStats,
  ProjectMimeTypeStats,
  ProjectPreview,
  ProjectPriorityStats,
  ProjectResource,
  ProjectResourceMemberStats,
  ProjectResourceStats,
  SystemProject
} from '@/types/project.type'
import type { TaskPreview, TaskStatusStats } from '@/types/task.type'

class ProjectService {
  private readonly baseUrl = 'projects'

  getProjects = async ({
    searchTerm,
    pageIndex,
    pageSize,
    startDate,
    endDate,
    organizationId,
    domainId,
    sortBy
  }: GetProjectsParams) => {
    const { data } = await api.get<BasePaginationResponse<SystemProject>>(`/v1/${this.baseUrl}`, {
      params: {
        searchTerm,
        pageIndex,
        pageSize,
        startDate,
        endDate,
        organizationId,
        domainId,
        sortBy
      }
    })

    return data
  }

  getMyProjects = async ({ userId, status, searchTerm, pageIndex, pageSize }: GetMyProjectsParams) => {
    const { data } = await api.get<BasePaginationResponse<ProjectPreview>>(`/v1/${this.baseUrl}/user`, {
      params: {
        userId,
        status,
        searchTerm,
        pageIndex,
        pageSize
      }
    })

    return data
  }

  createProject = async ({ body }: { body: CreateProjectFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, body)

    return data.value
  }

  getParentMilestones = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ParentMilestone>>(
      `/v1/${this.baseUrl}/${projectId}/milestones/parents`
    )

    return data
  }

  getMilestones = async ({ projectId, parentMilestoneId }: GetMilestonesParams) => {
    if (!projectId || !parentMilestoneId) return null
    const { data } = await api.get<BaseResponse<MilestoneWithTasks>>(
      `/v1/${this.baseUrl}/${projectId}/milestones/${parentMilestoneId}`
    )

    return data.value
  }

  getProjectMembers = async ({ projectId, searchTerm }: UseGetProjectMembersParams) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectMember>>(`/v1/${this.baseUrl}/${projectId}/members`, {
      params: {
        searchTerm
      }
    })

    return data
  }

  getProject = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BaseResponse<Project>>(`/v1/${this.baseUrl}/${projectId}`)

    return data.value
  }

  inviteMembers = async ({ body }: { body: InviteMembersPayload }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectId}/invite`, body)

    return data.value
  }

  respondToInvitation = async ({
    projectId,
    notificationId,
    isAccepted
  }: {
    projectId: string
    notificationId: string
    isAccepted: boolean
  }) => {
    const { data } = await api.get<BaseResponse<string>>(`/v1/${this.baseUrl}/${projectId}/response-invite`, {
      params: {
        notificationId,
        isAccepted
      }
    })

    return data.value
  }

  updateProject = async ({ body }: { body: Omit<UpdateProjectFormValues, 'domainIds'> & { domainIds: string[] } }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectId}`, body)

    return data.value
  }

  toggleEditor = async ({ projectId, userId, isEditor }: { projectId: string; userId: string; isEditor: boolean }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${projectId}/members`, {
      projectId,
      userId,
      isEditor
    })

    return data.value
  }

  deleteMember = async ({ projectId, userId }: { projectId: string; userId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${projectId}/members`, {
      data: {
        projectId,
        userId
      }
    })

    return data.value
  }

  getMyAssignedTasks = async ({ projectId, userId }: { projectId?: string; userId?: string }) => {
    if (!projectId || !userId) return null
    const { data } = await api.get<BasePaginationResponse<TaskPreview>>(
      `/v1/${this.baseUrl}/${projectId}/members/${userId}/tasks`
    )

    return data
  }

  getLabels = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<Label>>(`/v1/${this.baseUrl}/${projectId}/task-labels`)

    return data
  }

  addLabel = async ({ body }: { body: AddProjectLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectId}/task-labels`, body)

    return data.value
  }

  updateLabel = async ({ body }: { body: UpdateProjectLabelFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/task-labels/${body.id}`, body)

    return data.value
  }

  deleteLabel = async ({ labelId }: { labelId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/task-labels/${labelId}`)

    return data.value
  }

  getProjectResources = async ({
    projectId,
    pageIndex,
    pageSize,
    sortBy,
    name,
    from,
    to,
    mimeTypes,
    memberIds
  }: UseGetProjectResourcesParams) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectResource>>(
      `/v1/${this.baseUrl}/${projectId}/resources`,
      {
        params: {
          pageIndex,
          pageSize,
          sortBy,
          searchTerm: name,
          from,
          to,
          mimeTypes,
          memberIds
        }
      }
    )

    return data
  }

  getProjectLabelStats = async ({ projectId, parentMilestoneId }: UseGetProjectLabelStatsParams) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectLabelStats>>(
      `/v1/${this.baseUrl}/${projectId}/task-labels/statistic`,
      {
        params: {
          parentMilestoneId
        }
      }
    )

    return data
  }

  getTaskStatusStats = async ({ projectId, parentMilestoneId }: UseGetProjectLabelStatsParams) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<TaskStatusStats>>(
      `/v1/${this.baseUrl}/${projectId}/tasks-status/statistic`,
      {
        params: {
          parentMilestoneId
        }
      }
    )

    return data
  }

  getProjectMemberStats = async ({ projectId, parentMilestoneId }: UseGetProjectLabelStatsParams) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectMemberStats>>(
      `/v1/${this.baseUrl}/${projectId}/members-tasks/statistic`,
      {
        params: {
          parentMilestoneId
        }
      }
    )

    return data
  }

  getProjectResourceStats = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BaseResponse<ProjectResourceStats>>(
      `/v1/${this.baseUrl}/${projectId}/resources/statistic`
    )

    return data.value
  }

  getProjectMimeTypeStats = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectMimeTypeStats>>(
      `/v1/${this.baseUrl}/${projectId}/resources/mime-types/statistic`
    )

    return data
  }

  getProjectResourceMemberStats = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectResourceMemberStats>>(
      `/v1/${this.baseUrl}/${projectId}/resources/members/statistic`
    )

    return data
  }

  getProjectPriorityStats = async ({ projectId, parentMilestoneId }: UseGetProjectPriorityStatsParams) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectPriorityStats>>(
      `/v1/${this.baseUrl}/${projectId}/tasks-priority/statistic`,
      {
        params: {
          parentMilestoneId
        }
      }
    )

    return data
  }
}

const projectService = new ProjectService()
export default projectService
