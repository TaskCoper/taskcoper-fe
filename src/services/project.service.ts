import type { GetMilestonesParams } from '@/features/projects/hooks/use-get-milestones'
import type { GetMyProjectsParams } from '@/features/projects/hooks/use-get-my-projects'
import type { CreateProjectFormValues, UpdateProjectFormValues } from '@/features/projects/validations'
import api, { type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import type { MilestoneWithTasks, ParentMilestone } from '@/types/milestone.type'
import type { InviteMembersPayload, Project, ProjectMember, ProjectPreview } from '@/types/project.type'

class ProjectService {
  private readonly baseUrl = 'projects'

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

  getProjectMembers = async ({ projectId }: { projectId?: string }) => {
    if (!projectId) return null
    const { data } = await api.get<BasePaginationResponse<ProjectMember>>(`/v1/${this.baseUrl}/${projectId}/members`)

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
}

const projectService = new ProjectService()
export default projectService
