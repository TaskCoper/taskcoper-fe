import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { ProjectMember } from '@/features/projects/core/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { UserRoundPlusIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetProjectRoles } from '../../roles/hooks/use-get-project-roles'
import { useDeleteProjectMember } from '../hooks/use-delete-project-member'
import { useGetProjectMembers } from '../hooks/use-get-project-members'
import { useUpdateMemberRoles } from '../hooks/use-update-member-roles'
import InviteMembersDialog from './invite-members-dialog'
import { getColumns } from './project-member-columns'

interface ProjectMembersTabProps {
  projectIdentifier?: string
}

export default function ProjectMembersTab({ projectIdentifier }: ProjectMembersTabProps) {
  const { t } = useTranslation()
  const { me: user } = useGetMe()
  const { confirm } = useConfirmStore()

  const { projectRoles, isLoadingProjectRoles } = useGetProjectRoles({ identifier: projectIdentifier })
  const { updateMemberRoles, isUpdatingMemberRoles } = useUpdateMemberRoles({ identifier: projectIdentifier! })
  const { deleteProjectMember, isDeletingProjectMember } = useDeleteProjectMember({ identifier: projectIdentifier! })

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
        deleteProjectMember({ userId, identifier: projectIdentifier! })
      }
    },
    [confirm, deleteProjectMember, projectIdentifier, t]
  )

  const columns = useMemo(
    () =>
      getColumns({
        projectIdentifier,
        currentUserId: user?.id,
        roles: projectRoles.value.items,
        onUpdateRole: (userId, roleIds) =>
          updateMemberRoles({ userId, roleIds, projectIdentifier: projectIdentifier! }),
        onDeleteMember,
        isUpdatingRole: isUpdatingMemberRoles,
        isDeletingMember: isDeletingProjectMember
      }),
    [
      user?.id,
      projectRoles,
      updateMemberRoles,
      projectIdentifier,
      onDeleteMember,
      isUpdatingMemberRoles,
      isDeletingProjectMember
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
