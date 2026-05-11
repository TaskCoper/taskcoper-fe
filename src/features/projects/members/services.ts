import { api, type BasePaginationResponse, type BaseResponse } from '@/lib/axios'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMember } from '../core/types'
import type { GetProjectMembersParams } from './hooks/use-get-project-members'
import type { InviteMembersPayload, ProjectMemberDetail } from './types'

class ProjectMemberService {
  private readonly baseUrl = 'projects'

  getProjectMembers = async ({ identifier, searchTerm, pageIndex, pageSize, excludeIds }: GetProjectMembersParams) => {
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

  getProjectMember = async ({ projectIdentifier, userId }: { projectIdentifier?: string; userId?: string }) => {
    if (!projectIdentifier || !userId) return null
    const { data } = await api.get<BaseResponse<ProjectMemberDetail>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/members/${userId}`
    )

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

  deleteProjectMember = async ({ identifier, userId }: { identifier: string; userId: string }) => {
    const { data } = await api.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${identifier}/members`, {
      data: {
        identifier,
        userId
      }
    })

    return data.value
  }
}

const projectMemberService = new ProjectMemberService()
export default projectMemberService
