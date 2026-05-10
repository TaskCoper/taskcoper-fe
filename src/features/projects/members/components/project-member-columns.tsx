import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import MultiSelectField from '@/components/multi-select-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getAvatarFallback } from '@/shared/utils'
import type { ProjectMember, ProjectRoleItem } from '@/types/project.type'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import ProjectPositionTitleCombobox from '../../position-titles/components/project-position-title-combobox'

interface GetColumnsProps {
  currentUserId?: string
  roles: ProjectRoleItem[]
  onUpdateRole: (userId: string, roleIds: string[]) => void
  onDeleteMember: (userId: string, fullName: string, isSelf: boolean) => void
  isUpdatingRole: boolean
  isDeletingMember: boolean
  projectIdentifier?: string
}

export const getColumns = ({
  currentUserId,
  projectIdentifier,
  roles,
  onUpdateRole,
  onDeleteMember,
  isUpdatingRole,
  isDeletingMember
}: GetColumnsProps): ColumnDef<ProjectMember>[] => {
  return [
    {
      id: 'no',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18next.t('project.updateProjectMembers.column.no')}
          className='flex mx-auto'
        />
      ),
      cell: ({ row }) => {
        return <p className='text-center'>{row.index + 1}</p>
      },
      enableSorting: false,
      enableColumnFilter: false,
      size: 30
    },
    {
      id: 'member',
      accessorKey: 'email',
      meta: {
        label: i18next.t('project.updateProjectMembers.column.member'),
        placeholder: i18next.t('project.updateProjectMembers.column.memberPlaceholder'),
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={i18next.t('project.updateProjectMembers.column.member')} />
      ),
      cell: ({ row }) => {
        const { userId, fullName, avatar, slug } = row.original
        const isSelf = userId === currentUserId

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={avatar ?? ''} />
              <AvatarFallback>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>
            <div className='-space-y-0.5'>
              <Link
                to={`/projects/${projectIdentifier}/members/${slug}?tasks_isCompleted=false`}
                className='hover:underline hover:text-primary'
              >
                <p className='text-sm font-medium'>
                  {fullName}{' '}
                  {isSelf && <span className='text-xs text-muted-foreground'>({i18next.t('common.ui.me')})</span>}
                </p>
              </Link>
              <p className='text-xs text-muted-foreground'>{row.original.email}</p>
            </div>
          </div>
        )
      },
      enableColumnFilter: true,
      enableSorting: false,
      size: 200
    },
    {
      id: 'phoneNumber',
      accessorKey: 'phoneNumber',
      meta: {
        label: i18next.t('project.updateProjectMembers.column.phoneNumber')
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18next.t('project.updateProjectMembers.column.phoneNumber')}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => {
        if (!row.original.phoneNumber) {
          return (
            <p className='text-center text-muted-foreground'>
              {i18next.t('project.updateProjectMembers.column.noPhoneNumber')}
            </p>
          )
        }

        return <p className='text-center'>{row.original.phoneNumber}</p>
      },
      enableColumnFilter: true,
      enableSorting: false,
      size: 150
    },
    {
      id: 'positionTitles',
      accessorKey: 'positionTitles',
      meta: {
        label: i18next.t('project.updateProjectMembers.column.positionTitles'),
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18next.t('project.updateProjectMembers.column.positionTitles')}
        />
      ),
      cell: ({ row }) => {
        const { userId, positionTitles } = row.original

        return (
          <div className='w-full'>
            <ProjectPositionTitleCombobox
              projectIdentifier={projectIdentifier}
              userId={userId}
              selectedPositionTitles={positionTitles}
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 180
    },
    {
      id: 'roles',
      accessorKey: 'roles',
      meta: {
        label: i18next.t('project.updateProjectMembers.column.role'),
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={i18next.t('project.updateProjectMembers.column.role')} />
      ),
      cell: ({ row }) => {
        const { userId, roles: memberRoles } = row.original
        const selectedRoleIds = memberRoles.map((role) => role.id)

        return (
          <div className='max-w-full'>
            <MultiSelectField
              name={`role-${userId}`}
              label=''
              className='w-fit min-w-40'
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
                meta: { isSystem: role.isSystem, isDefault: role.isDefault }
              }))}
              value={selectedRoleIds}
              onValueChange={(value) => onUpdateRole(userId, value)}
              disabled={isUpdatingRole}
              placeholder='project.updateProjectMembers.column.rolePlaceholder'
              triggerClassName='h-8 w-fit px-1!'
              displayError={false}
              customBadgeRender={(option) => {
                return (
                  <div className='flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border max-w-full'>
                    <p className='text-xs font-semibold truncate max-w-20'>{option.label}</p>
                  </div>
                )
              }}
            />
          </div>
        )
      },
      enableColumnFilter: true,
      enableSorting: false,
      size: 200
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { userId, fullName } = row.original
        const isSelf = userId === currentUserId

        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon-sm'>
                  <MoreHorizontalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>{i18next.t('common.ui.action')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={isSelf ? '' : 'text-destructive focus:text-destructive'}
                  onClick={() => onDeleteMember(userId, fullName, isSelf)}
                  disabled={isDeletingMember}
                >
                  {isSelf ? i18next.t('common.button.leave') : i18next.t('common.button.remove')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 50
    }
  ]
}
