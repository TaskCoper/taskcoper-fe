import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import type { ProjectMemberRequest } from '../types'

interface GetColumnsProps {
  onDeleteRequest?: (request: ProjectMemberRequest) => void
  isDeletingRequest?: boolean
  canDelete?: boolean
}

export const getColumns = ({
  onDeleteRequest,
  isDeletingRequest = false,
  canDelete = true
}: GetColumnsProps = {}): ColumnDef<ProjectMemberRequest>[] => {
  const columns: ColumnDef<ProjectMemberRequest>[] = [
    {
      id: 'no',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18next.t('project.updateProjectMembers.column.no')}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => <p className='text-center'>{row.index + 1}</p>,
      enableSorting: false,
      enableColumnFilter: false,
      size: 30
    },
    {
      id: 'searchTerm',
      accessorFn: (row) => `${row.fullName} ${row.email}`,
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
        const { fullName, avatar, email } = row.original

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={avatar ?? ''} />
              <AvatarFallback>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>
            <div className='-space-y-0.5'>
              <p className='text-sm font-medium'>{fullName}</p>
              <p className='text-xs text-muted-foreground'>{email}</p>
            </div>
          </div>
        )
      },
      enableColumnFilter: true,
      enableSorting: false,
      size: 220
    },
    {
      id: 'roles',
      accessorFn: (row) => row.roles.map((role) => role.name).join(', '),
      meta: {
        label: i18next.t('project.updateProjectMembers.column.role')
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18next.t('project.updateProjectMembers.column.role')}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => {
        if (row.original.roles.length === 0) {
          return <p className='text-muted-foreground text-center'>{i18next.t('task.column.none')}</p>
        }

        return (
          <div className='flex flex-wrap gap-1 justify-center'>
            {row.original.roles.map((role) => (
              <div key={role.id} className='rounded-sm border px-2 py-0.5'>
                <p className='text-xs font-medium'>{role.name}</p>
              </div>
            ))}
          </div>
        )
      },
      enableColumnFilter: false,
      enableSorting: false,
      size: 150
    },
    // {
    //   id: 'status',
    //   accessorKey: 'status',
    //   meta: {
    //     label: 'common.ui.status'
    //   },
    //   header: ({ column }) => <DataTableColumnHeader column={column} label='common.ui.status' className='mx-auto' />,
    //   cell: ({ row }) => <p className='text-center'>{row.original.status}</p>,
    //   enableColumnFilter: false,
    //   enableSorting: false,
    //   size: 80
    // },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'systemUsers.column.createdAt'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemUsers.column.createdAt' className='mx-auto' />
      ),
      cell: ({ row }) => <p className='text-center'>{formatDate(row.original.createdOnUtc, 'dateShort')}</p>,
      enableColumnFilter: false,
      enableSorting: false,
      size: 80
    },
    {
      id: 'inviteExpireDate',
      accessorKey: 'inviteExpireDate',
      meta: {
        label: 'project.inviteMembers.field.expirationDate.label'
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label='project.inviteMembers.field.expirationDate.label'
          className='mx-auto'
        />
      ),
      cell: ({ row }) => {
        if (!row.original.inviteExpireDate) {
          return <p className='text-center text-muted-foreground'>{i18next.t('task.column.none')}</p>
        }

        return <p className='text-center'>{formatDate(row.original.inviteExpireDate, 'dateShort')}</p>
      },
      enableColumnFilter: false,
      enableSorting: false,
      size: 100
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{i18next.t('common.ui.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{i18next.t('common.ui.action')}</DropdownMenuLabel>
            {canDelete ? (
              <DropdownMenuItem
                className='focus:text-destructive'
                onClick={() => onDeleteRequest?.(row.original)}
                disabled={isDeletingRequest}
              >
                {i18next.t('common.button.delete')}
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50
    }
  ]

  return canDelete ? columns : columns.filter((column) => column.id !== 'actions')
}
