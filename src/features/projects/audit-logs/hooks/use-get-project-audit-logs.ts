import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectAuditLogService from '../services'
import type { AuditLog } from '../types'

export interface GetProjectAuditLogsParams {
  projectIdentifier?: string
  pageIndex?: number
  pageSize?: number
  searchTerm?: string
  from?: string
  to?: string
  actorUserId?: string
  entityType?: string
}

export const useGetProjectAuditLogs = ({
  projectIdentifier,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  searchTerm,
  from,
  to,
  actorUserId,
  entityType
}: GetProjectAuditLogsParams) => {
  const { data: projectAuditLogs = getDefaultPaginationResponse<AuditLog>(), isLoading: isLoadingProjectAuditLogs } =
    useQuery({
      queryKey: queryKeys.projects.auditLogs.list({
        projectIdentifier,
        pageIndex,
        pageSize,
        searchTerm,
        from,
        to,
        actorUserId,
        entityType
      }),
      queryFn: () =>
        projectAuditLogService.getProjectAuditLogs({
          projectIdentifier,
          pageIndex,
          pageSize,
          searchTerm,
          from,
          to,
          actorUserId,
          entityType
        }),
      enabled: !!projectIdentifier
    })

  return { projectAuditLogs, isLoadingProjectAuditLogs }
}
