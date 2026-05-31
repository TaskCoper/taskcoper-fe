import AvatarWithTooltip from '@/components/avatar-with-tooltip'
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
import { formatDate } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { CalendarIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { SystemProject, SystemProjectMember } from '../types'

export const getColumns = (): ColumnDef<SystemProject>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='systemProjects.column.selectAll'
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label='systemProjects.column.selectRow'
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
      accessorKey: 'projectName',
      meta: {
        label: 'systemProjects.column.projectName',
        placeholder: 'systemProjects.column.projectNamePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.projectName' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Avatar className='size-9 rounded-md shadow-sm border border-border'>
            <AvatarImage
              className='object-cover'
              src={row.original.coverImage || undefined}
              alt={row.original.projectName}
            />
            <AvatarFallback className='rounded-md text-xs'>
              {getAvatarFallback(row.original.projectName)}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col gap-0.5'>
            <Link to={`/dashboard/projects/${row.original.projectId}`} className='hover:underline font-medium'>
              {row.original.projectName}
            </Link>

            <div className='truncate flex gap-1'>
              {row.original.domains.slice(0, 3).map((domain) => (
                <Badge key={domain.id} className='rounded-sm py-0 px-1' variant='outline'>
                  <p className='text-[11px] font-normal'>{domain.name}</p>
                </Badge>
              ))}

              {row.original.domains.length > 3 && (
                <Badge className='rounded-sm py-0 px-1' variant='outline'>
                  <p className='text-[11px] font-normal'>+{row.original.domains.length - 3}</p>
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 150
    },
    {
      id: 'organizationId',
      accessorKey: 'organizationId',
      meta: {
        label: 'systemProjects.column.organization',
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemProjects.column.organization' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const { organizationName, organizationAvatar } = row.original
        if (!organizationName)
          return (
            <p className='text-center text-muted-foreground'>{i18next.t('systemProjects.column.noOrganization')}</p>
          )

        return (
          <div className='flex justify-center items-center gap-3'>
            <Avatar className='size-6 ring-2 ring-orange-400 ring-offset-2'>
              <AvatarImage src={organizationAvatar || ''} alt={organizationName} />
              <AvatarFallback className='text-xs'>{getAvatarFallback(organizationName)}</AvatarFallback>
            </Avatar>

            <p>{organizationName}</p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'projectTeamSize',
      accessorKey: 'projectTeamSize',
      meta: {
        label: 'systemProjects.column.teamSize'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.teamSize' />,
      cell: ({ row }) => {
        const value = row.getValue('projectTeamSize')
        if (!value) return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.notProvided')}</p>

        return <p>{value as number}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'projectSchoolSubject',
      accessorKey: 'projectSchoolSubject',
      meta: {
        label: 'systemProjects.column.schoolSubject'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.schoolSubject' />,
      cell: ({ row }) => {
        const value = row.getValue('projectSchoolSubject')
        if (!value) return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.notProvided')}</p>

        return <p>{value as string}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'createBy',
      accessorKey: 'createBy',
      meta: { label: 'systemProjects.column.createdBy' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.createdBy' />,
      cell: ({ row }) => {
        const { createBy } = row.original
        if (!createBy) return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.noCreator')}</p>

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-6 ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={createBy.avatar || ''} alt={createBy.fullName} />
              <AvatarFallback className='text-xs'>{getAvatarFallback(createBy.fullName)}</AvatarFallback>
            </Avatar>

            <p>{createBy.fullName}</p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 70
    },
    {
      id: 'members',
      accessorKey: 'members',
      meta: { label: 'systemProjects.column.members' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemProjects.column.members' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const members = row.getValue('members') as SystemProjectMember[]
        if (members.length === 0)
          return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.noMembers')}</p>

        return (
          <div className='flex justify-center items-center -space-x-1'>
            {members.slice(0, 4).map((member) => (
              <AvatarWithTooltip
                key={member.userId}
                avatar={member.avatar}
                fullName={member.fullName}
                email={member.email}
                className='ring-2 ring-primary ring-offset-2 cursor-pointer'
              />
            ))}
            {members.length > 4 && (
              <Avatar className='size-6 ring-2 ring-primary ring-offset-2'>
                <AvatarFallback className='text-xs'>+{members.length - 4}</AvatarFallback>
              </Avatar>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 100
    },
    {
      id: 'startDate',
      accessorKey: 'projectStartDate',
      meta: {
        label: 'systemProjects.column.startDate',
        placeholder: 'systemProjects.column.startDatePlaceholder',
        variant: 'date',
        icon: CalendarIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.startDate' />,
      cell: ({ row }) => {
        const value = row.getValue('startDate')
        if (!value) return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.notProvided')}</p>

        return <p>{formatDate(value as string, 'dateLong')}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'endDate',
      accessorKey: 'projectEndDate',
      meta: {
        label: 'systemProjects.column.endDate',
        placeholder: 'systemProjects.column.endDatePlaceholder',
        variant: 'date',
        icon: CalendarIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.endDate' />,
      cell: ({ row }) => {
        const value = row.getValue('endDate')
        if (!value) return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.notProvided')}</p>

        return <p>{formatDate(value as string, 'dateLong')}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { projectId } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('systemProjects.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('systemProjects.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(projectId)}>
                {i18next.t('systemProjects.actions.copyProjectId')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{i18next.t('systemProjects.actions.viewProject')}</DropdownMenuItem>
              <DropdownMenuItem>{i18next.t('systemProjects.actions.viewProjectDetails')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 30
    },
    {
      id: 'domainId',
      accessorFn: (row) => row.domains.map((d) => d.domainId),
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
