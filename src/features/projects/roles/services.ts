import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/services/base.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectPermission, ProjectRoleDetail, ProjectRoleItem, ProjectRoleTemplate } from './types'
import type { AddProjectRoleFormValues, UpdateProjectRoleFormValues } from './validations'

class ProjectRoleService extends BaseService {
  private readonly baseUrl = 'projects'

  getMyProjectPermissions = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return null
    const { data } = await this.get<BaseResponse<ProjectPermission>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/permissions/me`
    )

    return data.value
  }

  getProjectRoles = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    if (!projectIdentifier) return getDefaultPaginationResponse<ProjectRoleItem>()
    const { data } = await this.get<BasePaginationResponse<ProjectRoleItem>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/roles`
    )

    return data
  }

  getProjectRole = async ({ projectIdentifier, roleId }: { projectIdentifier?: string; roleId?: string }) => {
    if (!projectIdentifier || !roleId) return null
    const { data } = await this.get<BaseResponse<ProjectRoleDetail>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/roles/${roleId}/permissions`
    )

    return data.value
  }

  addProjectRole = async ({ body }: { body: AddProjectRoleFormValues }) => {
    const { data } = await this.post<BaseResponse<string>>(`/v1/${this.baseUrl}/${body.projectIdentifier}/roles`, {
      ...body,
      permissions: body.permissions.map((per) => ({
        ...per,
        extensions: per.extensions ? JSON.stringify(per.extensions) : null
      }))
    })

    return data.value
  }

  updateProjectRole = async ({ body }: { body: UpdateProjectRoleFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(
      `/v1/${this.baseUrl}/${body.projectIdentifier}/roles/${body.roleId}`,
      {
        ...body,
        permissions: body.permissions.map((per) => ({
          ...per,
          extensions: per.extensions ? JSON.stringify(per.extensions) : null
        }))
      }
    )

    return data.value
  }

  deleteProjectRole = async ({ projectIdentifier, roleId }: { projectIdentifier: string; roleId: string }) => {
    const { data } = await this.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${projectIdentifier}/roles/${roleId}`)

    return data.value
  }

  getProjectRoleTemplates = async ({ projectIdentifier }: { projectIdentifier?: string }) => {
    const { data } = await this.get<BasePaginationResponse<ProjectRoleTemplate>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/roles/template`
    )

    return data
  }
}

const projectRoleService = new ProjectRoleService()
export default projectRoleService
