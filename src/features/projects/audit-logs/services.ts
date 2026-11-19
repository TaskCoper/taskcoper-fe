import { api, type BasePaginationResponse } from '@/lib/axios'
import type { GetProjectAuditLogsParams } from './hooks/use-get-project-audit-logs'
import type { AuditLog } from './types'

class ProjectAuditLogService {
  private readonly baseUrl = 'projects'

  getProjectAuditLogs = async ({
    projectIdentifier,
    pageIndex,
    pageSize,
    searchTerm,
    from,
    to,
    actorUserId,
    entityType
  }: GetProjectAuditLogsParams) => {
    if (!projectIdentifier) return null

    const { data } = await api.get<BasePaginationResponse<AuditLog>>(
      `/v1/${this.baseUrl}/${projectIdentifier}/audit-logs`,
      {
        params: {
          pageIndex,
          pageSize,
          searchTerm,
          from,
          to,
          actorUserId,
          entityType
        }
      }
    )

    return data
  }
}

const projectAuditLogService = new ProjectAuditLogService()
export default projectAuditLogService
