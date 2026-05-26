import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatDate, getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import {
  CircleUserIcon,
  CircleUserRoundIcon,
  FileQuestionIcon,
  FolderPlusIcon,
  GraduationCapIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SettingsIcon
} from 'lucide-react'
import { Link } from 'react-router'
import type { User } from '../../types'

const roleConfig: Record<
  string,
  {
    icon: React.ElementType
    style: string
  }
> = {
  Admin: {
    icon: SettingsIcon,
    style: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
  },
  Mentor: {
    icon: GraduationCapIcon,
    style:
      'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
  },
  User: {
    icon: CircleUserRoundIcon,
    style: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800'
  },
  Guest: {
    icon: FileQuestionIcon,
    style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
  }
}

export const getColumns = (): ColumnDef<User>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='systemUsers.column.selectAll'
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label='systemUsers.column.selectRow'
          className='translate-y-0.5'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30
    },
    {
      id: 'name',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      meta: {
        label: 'systemUsers.column.name',
        placeholder: 'systemUsers.column.namePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemUsers.column.name' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Avatar className='size-7 ring-2 ring-primary ring-offset-2'>
            <AvatarImage src={row.original.avatar || undefined} alt={row.original.email} />
            <AvatarFallback className='text-xs'>
              {getAvatarFallback(`${row.original.firstName} ${row.original.lastName}`)}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col'>
            <Link to={`/dashboard/users/${row.original.id}`} className='hover:underline font-medium'>
              {row.original.firstName} {row.original.lastName}
            </Link>
            <p className='text-xs text-muted-foreground'>{row.original.email}</p>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 200
    },
    {
      id: 'role',
      accessorKey: 'role',
      meta: {
        label: 'systemUsers.column.role',
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemUsers.column.role' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const role = row.original.role
        const config = roleConfig[role] || roleConfig.Guest
        const Icon = config.icon

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={cn(
                'flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-semibold border',
                config.style
              )}
            >
              <Icon className='size-4' />
              <p>{role}</p>
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 60
    },
    {
      id: 'organizationId',
      accessorKey: 'organizationId',
      meta: {
        label: 'systemUsers.column.organization',
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemUsers.column.organization' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const { organizationName, organizationAvatar } = row.original
        if (!organizationName)
          return <p className='text-muted-foreground text-center'>{i18next.t('systemUsers.column.noOrganization')}</p>

        return (
          <div className='flex justify-center items-center gap-3'>
            <Avatar className='size-6 ring-2 ring-orange-400 ring-offset-2'>
              <AvatarImage src={organizationAvatar || ''} alt={organizationName} />
              <AvatarFallback className='text-xs'>{getAvatarFallback(organizationName)}</AvatarFallback>
            </Avatar>

            <p className='truncate max-w-30'>{organizationName}</p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 150
    },
    {
      id: 'domains',
      accessorFn: (row) => row.domains.map((d) => d.id),
      meta: {
        label: 'systemUsers.column.domains'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemUsers.column.domains' />,
      cell: ({ row }) => {
        const domains = row.original.domains
        if (!domains || domains.length === 0)
          return <p className='text-muted-foreground'>{i18next.t('systemUsers.column.noDomains')}</p>

        return (
          <div className='flex flex-wrap gap-1'>
            {domains.slice(0, 2).map((domain) => (
              <Badge key={domain.id} variant='secondary' className='rounded-sm py-0 px-1.5'>
                <p className='text-[11px] font-normal'>{domain.name}</p>
              </Badge>
            ))}

            {domains.length > 2 && (
              <Badge variant='secondary' className='rounded-sm py-0 px-1.5'>
                <p className='text-[11px] font-normal'>+{domains.length - 2}</p>
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'location',
      accessorFn: (row) => row.city || row.state,
      meta: {
        label: 'systemUsers.column.location'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemUsers.column.location' />,
      cell: ({ row }) => {
        const { city, state } = row.original
        if (!city && !state)
          return <p className='text-muted-foreground'>{i18next.t('systemUsers.column.noLocation')}</p>

        return (
          <div className='flex items-center gap-1.5 text-sm'>
            <MapPinIcon className='size-3.5 text-muted-foreground' />
            <p className='truncate max-w-30'>{[city, state].filter(Boolean).join(', ')}</p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'projectStats',
      accessorFn: (row) => row.projectCreatedCount + row.projectJoinCount,
      meta: {
        label: 'systemUsers.column.projects'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemUsers.column.projects' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const { projectCreatedCount, projectJoinCount } = row.original

        return (
          <div className='flex items-center justify-center gap-3 text-sm'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center gap-1.5'>
                  <FolderPlusIcon className='size-4 text-green-600' />
                  <p className='text-xs font-medium'>{projectCreatedCount}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{i18next.t('systemUsers.column.created')}</p>
              </TooltipContent>
            </Tooltip>

            <div className='h-4 w-px bg-muted-foreground/50 shrink-0' />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center gap-1.5'>
                  <CircleUserIcon className='size-4 text-fuchsia-600' />
                  <p className='text-xs font-medium'>{projectJoinCount}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{i18next.t('systemUsers.column.joined')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'systemUsers.column.createdAt'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemUsers.column.createdAt' />,
      cell: ({ row }) => {
        const value = row.getValue('createdOnUtc')
        if (!value) return <p className='text-muted-foreground'>-</p>
        return <p className='text-sm'>{formatDate(value as string)}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 100
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, email } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <p className='sr-only'>{i18next.t('systemUsers.actions.openMenu')}</p>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('systemUsers.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(id)}>
                {i18next.t('systemUsers.actions.copyUserId')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(email)}>
                {i18next.t('systemUsers.actions.copyEmail')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{i18next.t('systemUsers.actions.viewProfile')}</DropdownMenuItem>
              <DropdownMenuItem>{i18next.t('systemUsers.actions.editUser')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive'>
                {i18next.t('systemUsers.actions.deleteUser')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    },
    {
      id: 'domainId',
      accessorFn: (row) => row.domains.map((d) => d.id),
      meta: {
        label: 'systemProjects.column.domain',
        variant: 'multiSelect'
      },
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 0
    }
  ]
}
