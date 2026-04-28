import type { UploadProjectAttachmentFormValues } from '@/features/attachments/validations'
import type { UseGetProjectLabelStatsParams } from '@/features/labels/hooks/use-get-project-label-stats'
import type { UseGetProjectPriorityStatsParams } from '@/features/labels/hooks/use-get-project-priority-stats'
import type {
  AddProjectLabelFormValues,
  AddProjectRevenueLabelFormValues,
  UpdateProjectLabelFormValues,
  UpdateProjectRevenueLabelFormValues
} from '@/features/labels/validations'
import type { GetMilestonesParams } from '@/features/milestones/hooks/use-get-milestones'
import type { GetMyProjectsParams } from '@/features/projects/hooks/use-get-my-projects'
import type { UseGetProjectMembersParams } from '@/features/projects/hooks/use-get-project-members'
import type { UseGetProjectResourcesParams } from '@/features/projects/hooks/use-get-project-resources'
import type { GetProjectRevenuesParams } from '@/features/projects/hooks/use-get-project-revenues'
import type { GetProjectsParams } from '@/features/projects/hooks/use-get-projects'
import type {
  AddProjectPositionTitleFormValues,
  AddProjectRevenueFormValues,
  AddProjectRoleFormValues,
  CreateProjectFormValues,
  UpdateProjectFormValues,
  UpdateProjectPositionTitleFormValues,
  UpdateProjectRevenueFormValues,
  UpdateProjectRoleFormValues
} from '@/features/projects/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Label, ProjectLabelStats, RevenueLabel } from '@/types/label.type'
import type { MilestoneWithTasks, ParentMilestone } from '@/types/milestone.type'
import type {
  InviteMembersPayload,
  Project,
  ProjectMember,
  ProjectMemberDetail,
  ProjectMemberPositionTitle,
  ProjectMemberStats,
  ProjectMimeTypeStats,
  ProjectPermission,
  ProjectPositionTitle,
  ProjectPreview,
  ProjectPriorityStats,
  ProjectResource,
  ProjectResourceMemberStats,
  ProjectResourceStats,
  ProjectRoleDetail,
  ProjectRoleItem,
  ProjectRoleTemplate,
  Revenue,
  RevenueLabelStats,
  RevenueStats,
  RevenueTypeStats,
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

  getParentMilestones = async ({ identifier }: { identifier?: string }) => {
    if (!identifier) return null
    const { data } = await api.get<BasePaginationResponse<ParentMilestone>>(
      `/v1/${this.baseUrl}/${identifier}/milestones/parents`
    )

    return data
  }

  getMilestones = async ({ projectIdentifier, parentMilestoneIdentifier }: GetMilestonesParams) => {
    if (!projectIdentifier || !parentMilestoneIdentifier) return null
    const { data } = await api.get<BaseResponse<MilestoneWithTasks>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/milestones/${parentMilestoneIdentifier}`
    )

    return data.value
  }

  getProjectMembers = async ({
    identifier,
    searchTerm,
    pageIndex,
    pageSize,
    excludeIds
  }: UseGetProjectMembersParams) => {
    if (!identifier) return getDefaultPaginationResponse<ProjectMember>()
    const { data } = await api.get<BasePaginationResponse<ProjectMember>>(`/v1/${this.baseUrl}/${identifier}/members`, {
      params: {
        searchTerm,
        pageIndex,
        pageSize,
        excludeIds
      }
    })

    return data
  }

  getProject = async ({ identifier }: { identifier?: string }) => {
    if (!identifier) return null
    const { data } = await api.get<BaseResponse<Project>>(`/v1/${this.baseUrl}/${identifier}`)

    return data.value
  }

  inviteMembers = async ({ body }: { body: InviteMembersPayload }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectIdentifier}/invite`, body)

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

  toggleEditor = async ({
    identifier,
    userId,
    isEditor
  }: {
    identifier: string
    userId: string
    isEditor: boolean
  }) => {
    const { data } = await api.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${identifier}/members`, {
      identifier,
      userId,
      isEditor
    })

    return data.value
  }

  updateMemberRoles = async ({
    projectIdentifier,
    userId,
    roleIds
  }: {
    projectIdentifier: string
    userId: string
    roleIds: string[]
  }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}/roles`,
      {
        projectIdentifier,
        userId,
        roleIds
      }
    )

    return data.value
  }

  deleteMember = async ({ identifier, userId }: { identifier: string; userId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${identifier}/members`, {
      data: {
        identifier,
        userId
      }
    })

    return data.value
  }

  getMyAssignedTasks = async ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
    if (!projectIdentifier || !userId) return null
    const { data } = await api.get<BasePaginationResponse<TaskPreview>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}/tasks`
    )

    return data
  }

  getLabels = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<Label>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/task-labels`
    )

    return data
  }

  addLabel = async ({ body }: { body: AddProjectLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/task-labels`,
      body
    )

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
    projectIdentifier,
    pageIndex,
    pageSize,
    sortBy,
    name,
    from,
    to,
    mimeTypes,
    memberIds
  }: UseGetProjectResourcesParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<ProjectResource>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources`,
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

  getProjectLabelStats = async ({ projectIdentifier, parentMilestoneIdentifier }: UseGetProjectLabelStatsParams) => {
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

  getTaskStatusStats = async ({ projectIdentifier, parentMilestoneIdentifier }: UseGetProjectLabelStatsParams) => {
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

  getProjectMemberStats = async ({ projectIdentifier, parentMilestoneIdentifier }: UseGetProjectLabelStatsParams) => {
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

  getProjectPriorityStats = async ({
    projectIdentifier,
    parentMilestoneIdentifier
  }: UseGetProjectPriorityStatsParams) => {
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

  uploadAttachment = async ({ body }: { body: UploadProjectAttachmentFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/resources`,
      body
    )

    return data.value
  }

  deleteAttachment = async ({ projectIdentifier, resourceId }: { projectIdentifier: string; resourceId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/resources/${resourceId}`
    )

    return data.value
  }

  getProjectRevenues = async ({
    projectIdentifier,
    pageIndex,
    pageSize,
    labelIds,
    searchTerm,
    type,
    sortBy,
    startDate,
    endDate
  }: GetProjectRevenuesParams) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BasePaginationResponse<Revenue>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues`,
      {
        params: {
          pageIndex,
          pageSize,
          labelIds,
          searchTerm,
          type,
          sortBy,
          startDate,
          endDate
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

  addProjectRevenue = async ({ body }: { body: AddProjectRevenueFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues`,
      body
    )

    return data.value
  }

  updateProjectRevenue = async ({ body }: { body: UpdateProjectRevenueFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues/${body.projectTransactionId}`,
      body
    )

    return data.value
  }

  deleteProjectRevenue = async ({ projectIdentifier, revenueId }: { projectIdentifier: string; revenueId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/${revenueId}`
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

  getProjectRevenueLabels = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<RevenueLabel>()
    const { data } = await api.get<BasePaginationResponse<RevenueLabel>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/labels`
    )

    return data
  }

  addProjectRevenueLabel = async ({ body }: { body: AddProjectRevenueLabelFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues/labels`,
      body
    )

    return data.value
  }

  updateProjectRevenueLabel = async ({ body }: { body: UpdateProjectRevenueLabelFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/revenues/labels/${body.id}`,
      body
    )

    return data.value
  }

  deleteProjectRevenueLabel = async ({
    projectIdentifier,
    labelId
  }: {
    projectIdentifier: string
    labelId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/revenues/labels/${labelId}`
    )

    return data.value
  }

  getMyProjectPermissions = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await api.get<BaseResponse<ProjectPermission>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/permissions/me`
    )

    return data.value
  }

  getProjectRoles = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<ProjectRoleItem>()
    const { data } = await api.get<BasePaginationResponse<ProjectRoleItem>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/roles`
    )

    return data
  }

  getProjectRole = async ({ projectIdentifier, roleId }: { projectIdentifier?: string; roleId?: string }) => {
    if (!projectIdentifier || !roleId) return null
    const { data } = await api.get<BaseResponse<ProjectRoleDetail>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/roles/${roleId}/permissions`
    )

    return data.value
  }

  updateProjectRole = async ({ body }: { body: UpdateProjectRoleFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/roles/${body.roleId}`,
      {
        ...body,
        permissions: body.permissions.map((per) => ({
          ...per,
          extensions: JSON.stringify(per.extensions)
        }))
      }
    )

    return data.value
  }

  deleteProjectRole = async ({ projectIdentifier, roleId }: { projectIdentifier: string; roleId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${projectIdentifier}/roles/${roleId}`)

    return data.value
  }

  getProjectRoleTemplates = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    const { data } = await api.get<BasePaginationResponse<ProjectRoleTemplate>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/roles/template`
    )

    return data
  }

  addProjectRole = async ({ body }: { body: AddProjectRoleFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectIdentifier}/roles`, {
      ...body,
      permissions: body.permissions.map((per) => ({
        ...per,
        extensions: JSON.stringify(per.extensions)
      }))
    })

    return data.value
  }

  getProjectPositionTitles = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<ProjectPositionTitle>()
    const { data } = await api.get<BasePaginationResponse<ProjectPositionTitle>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles`
    )

    return data
  }

  addProjectPositionTitle = async ({ body }: { body: AddProjectPositionTitleFormValues }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/position-titles`,
      body
    )

    return data.value
  }

  updateProjectPositionTitle = async ({ body }: { body: UpdateProjectPositionTitleFormValues }) => {
    const { data } = await api.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/position-titles/${body.titleId}`,
      body
    )

    return data.value
  }

  deleteProjectPositionTitle = async ({
    projectIdentifier,
    titleId
  }: {
    projectIdentifier: string
    titleId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles/${titleId}`
    )
    return data.value
  }

  assignProjectPositionTitle = async ({
    projectIdentifier,
    titleId,
    userId
  }: {
    projectIdentifier: string
    titleId: string
    userId: string
  }) => {
    const { data } = await api.post<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles/${titleId}/members`,
      {
        userId,
        projectIdentifier,
        titleId
      }
    )

    return data.value
  }

  unassignProjectPositionTitle = async ({
    projectIdentifier,
    titleId,
    userId
  }: {
    projectIdentifier: string
    titleId: string
    userId: string
  }) => {
    const { data } = await api.delete<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/position-titles/${titleId}/members/${userId}`
    )

    return data.value
  }

  getProjectMemberPositionTitles = async ({
    projectIdentifier,
    userId
  }: {
    projectIdentifier?: string
    userId?: string
  }) => {
    if (!projectIdentifier || !userId) return getDefaultPaginationResponse<ProjectMemberPositionTitle>()
    const { data } = await api.get<BasePaginationResponse<ProjectMemberPositionTitle>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}/position-titles`
    )

    return data
  }

  getProjectMember = async ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
    if (!projectIdentifier || !userId) return null
    const { data } = await api.get<BaseResponse<ProjectMemberDetail>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}`
    )

    return data.value
  }

  getProjectsForPackage = async () => {
    const { data } = await api.get<
      BasePaginationResponse<Pick<Project, 'id' | 'slug' | 'name' | 'logoImage' | 'coverImage'>>
    >(`/v1/${this.baseUrl}/me/bookable-for-mentor-package`)

    return data
  }
}

const projectService = new ProjectService()
export default projectService
