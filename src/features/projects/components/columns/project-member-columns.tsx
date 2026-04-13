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
import { cn, getAvatarFallback } from '@/shared/utils'
import { ProjectRoleName } from '@/types/project-permission.type'
import type { ProjectMember, ProjectRoleItem } from '@/types/project.type'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { CrownIcon, EyeIcon, MoreHorizontalIcon, PencilIcon, SearchIcon, SettingsIcon } from 'lucide-react'
import { Link } from 'react-router'

interface GetColumnsProps {
  currentUserId?: string
  roles: ProjectRoleItem[]
  onUpdateRole: (userId: string, roleIds: string[]) => void
  onDeleteMember: (userId: string, fullName: string, isSelf: boolean) => void
  isUpdatingRole: boolean
  isDeletingMember: boolean
  projectIdentifier?: string
}

export const RoleIconMap: Record<ProjectRoleName, React.ElementType> = {
  [ProjectRoleName.Owner]: CrownIcon,
  [ProjectRoleName.Admin]: SettingsIcon,
  [ProjectRoleName.Editor]: PencilIcon,
  [ProjectRoleName.Viewer]: EyeIcon
}

export const RoleColorMap: Record<ProjectRoleName, string> = {
  [ProjectRoleName.Owner]: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
  [ProjectRoleName.Admin]: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
  [ProjectRoleName.Editor]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  [ProjectRoleName.Viewer]: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20'
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
        const { userId, fullName, avatar } = row.original
        const isSelf = userId === currentUserId

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={avatar ?? ''} />
              <AvatarFallback>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>
            <div className='-space-y-0.5'>
              <Link
                to={`/projects/${projectIdentifier}/members/${userId}`}
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
      id: 'roles',
      accessorKey: 'roles',
      meta: {
        label: i18next.t('project.updateProjectMembers.column.role'),
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18next.t('project.updateProjectMembers.column.role')}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => {
        const { userId, roles: memberRoles } = row.original
        const selectedRoleIds = memberRoles.map((role) => role.id)

        return (
          <div className='flex justify-center'>
            <MultiSelectField
              name={`role-${userId}`}
              label=''
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
                meta: { isSystem: role.isSystem, isDefault: role.isDefault }
              }))}
              value={selectedRoleIds}
              onValueChange={(value) => onUpdateRole(userId, value)}
              disabled={isUpdatingRole}
              placeholder='project.updateProjectMembers.column.role'
              triggerClassName='h-8 px-1!'
              displayError={false}
              customBadgeRender={(option) => {
                const roleName = option.label as ProjectRoleName
                const RoleIcon = RoleIconMap[roleName] || EyeIcon

                return (
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border',
                      RoleColorMap[roleName] || 'bg-muted text-muted-foreground'
                    )}
                  >
                    <RoleIcon className='size-3 shrink-0' />

                    <p className='text-xs font-semibold'>{option.label}</p>

                    {/* {!!(option.meta?.isSystem || option.meta?.isDefault) && (
                      <TooltipProvider>
                        <div className='flex items-center gap-0.5 border-l pl-1 border-current/30'>
                          {option.meta?.isSystem ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className='inline-flex cursor-help'>
                                  <ShieldIcon className='size-3 shrink-0' />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {i18next.t('project.updateProjectMembers.role.systemTooltip')}
                              </TooltipContent>
                            </Tooltip>
                          ) : null}

                          {option.meta?.isDefault ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className='inline-flex cursor-help'>
                                  <StarIcon className='size-3 shrink-0' />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {i18next.t('project.updateProjectMembers.role.defaultTooltip')}
                              </TooltipContent>
                            </Tooltip>
                          ) : null}
                        </div>
                      </TooltipProvider>
                    )} */}
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
