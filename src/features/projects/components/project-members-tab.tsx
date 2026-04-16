import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { ProjectMember } from '@/types/project.type'
import { UserRoundPlusIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteMember } from '../hooks/use-delete-member'
import { useGetProjectMembers } from '../hooks/use-get-project-members'
import { useGetProjectRoles } from '../hooks/use-get-project-roles'
import { useUpdateMemberRoles } from '../hooks/use-update-member-roles'
import { getColumns } from './columns/project-member-columns'
import InviteMembersDialog from './dialogs/invite-members-dialog'

interface ProjectMembersTabProps {
  projectIdentifier?: string
}

export default function ProjectMembersTab({ projectIdentifier }: ProjectMembersTabProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { confirm } = useConfirmStore()

  const { projectRoles, isLoadingProjectRoles } = useGetProjectRoles({ identifier: projectIdentifier })
  const { updateMemberRoles, isUpdatingMemberRoles } = useUpdateMemberRoles({ identifier: projectIdentifier! })
  const { deleteMember, isDeletingMember } = useDeleteMember({ identifier: projectIdentifier! })

  const onDeleteMember = useCallback(
    async (userId: string, fullName: string, isSelf: boolean) => {
      const confirmed = await confirm({
        title: isSelf
          ? t('project.updateProjectMembers.confirm.leaveTitle')
          : t('project.updateProjectMembers.confirm.title'),
        description: isSelf
          ? t('project.updateProjectMembers.confirm.leaveDescription')
          : t('project.updateProjectMembers.confirm.description', { fullName }),
        confirmText: isSelf ? t('common.button.leave') : t('project.updateProjectMembers.confirm.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (confirmed) {
        deleteMember({ userId, identifier: projectIdentifier! })
      }
    },
    [confirm, deleteMember, projectIdentifier, t]
  )

  const columns = useMemo(
    () =>
      getColumns({
        projectIdentifier,
        currentUserId: user?.UserId,
        roles: projectRoles.value.items,
        onUpdateRole: (userId, roleIds) =>
          updateMemberRoles({ userId, roleIds, projectIdentifier: projectIdentifier! }),
        onDeleteMember,
        isUpdatingRole: isUpdatingMemberRoles,
        isDeletingMember
      }),
    [
      user?.UserId,
      projectRoles,
      updateMemberRoles,
      projectIdentifier,
      onDeleteMember,
      isUpdatingMemberRoles,
      isDeletingMember
    ]
  )

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'members'
  })

  const { members, isLoadingMembers } = useGetProjectMembers({
    identifier: projectIdentifier,
    pageIndex: page,
    pageSize: limit
  })

  const { table } = useDataTable({
    data: members.value.items,
    columns,
    pageCount: Math.ceil(members.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<ProjectMember>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ userId }) => userId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'members_page',
      perPage: 'members_perPage',
      sort: 'members_sort'
    },
    filterPrefix: 'members'
  })

  const isLoading = isLoadingMembers || isLoadingProjectRoles

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('project.updateProjectMembers.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.updateProjectMembers.description')}</p>
      </div>

      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table}>
          {projectIdentifier ? (
            <InviteMembersDialog projectIdentifier={projectIdentifier}>
              <Button size='sm'>
                <UserRoundPlusIcon />
                {t('project.info.inviteMembers')}
              </Button>
            </InviteMembersDialog>
          ) : null}
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
