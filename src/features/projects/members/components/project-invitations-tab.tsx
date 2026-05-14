import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetProjectMemberRequests } from '../hooks/use-get-project-member-requests'
import { useRevokeInvitation } from '../hooks/use-revoke-invitation'
import type { ProjectMemberRequest } from '../types'
import { getColumns } from './project-member-invitation-columns'

interface ProjectInvitationsTabProps {
  projectIdentifier?: string
}

export default function ProjectInvitationsTab({ projectIdentifier }: ProjectInvitationsTabProps) {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { revokeInvitation, isRevokeInvitation } = useRevokeInvitation()

  const onDeleteRequest = useCallback(
    async (request: ProjectMemberRequest) => {
      if (!projectIdentifier) return

      const confirmed = await confirm({
        title: t('project.inviteMembers.revokeInvitation.title'),
        description: t('project.inviteMembers.revokeInvitation.description', { fullName: request.fullName }),
        confirmText: t('project.inviteMembers.revokeInvitation.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (confirmed) {
        revokeInvitation({
          projectIdentifier,
          projectManagementId: request.projectManagementId
        })
      }
    },
    [confirm, projectIdentifier, revokeInvitation, t]
  )

  const columns = useMemo(
    () =>
      getColumns({
        onDeleteRequest,
        isDeletingRequest: isRevokeInvitation
      }),
    [onDeleteRequest, isRevokeInvitation]
  )

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'memberRequests'
  })

  const [searchTermFilter] = useQueryState('memberRequests_searchTerm', parseAsString)
  const searchTerm = searchTermFilter ?? undefined

  const { memberRequest, isLoadingMemberRequests } = useGetProjectMemberRequests({
    projectIdentifier,
    isInviteUser: true,
    pageIndex: page,
    pageSize: limit,
    searchTerm
  })

  const { table } = useDataTable({
    data: memberRequest.value.items,
    columns,
    pageCount: Math.ceil(memberRequest.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<ProjectMemberRequest>[]
    },
    getRowId: ({ userId, projectManagementId }) => `${projectManagementId}-${userId}`,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'memberRequests_page',
      perPage: 'memberRequests_perPage',
      sort: 'memberRequests_sort'
    },
    filterPrefix: 'memberRequests'
  })

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('project.inviteMembers.pendingInvites.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.inviteMembers.pendingInvites.description')}</p>
      </div>

      <DataTable table={table} isLoading={isLoadingMemberRequests}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  )
}
