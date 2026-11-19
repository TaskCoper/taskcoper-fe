import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { SearchIcon } from 'lucide-react'
import type { ProjectActivity } from '../types'

export const getColumns = (): ColumnDef<ProjectActivity>[] => [
  {
    id: 'searchTerm',
    accessorFn: (row) => `${row.actor.firstName} ${row.actor.lastName}`,
    meta: {
      label: i18next.t('project.activity.columnActor'),
      placeholder: i18next.t('project.activity.searchPlaceholder'),
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label={i18next.t('project.activity.columnActor')} />,
    cell: ({ row }) => {
      const { firstName, lastName, avatar } = row.original.actor

      return (
        <div className='flex items-center gap-3'>
          <Avatar className='size-8'>
            <AvatarImage src={avatar ?? ''} />
            <AvatarFallback>{getAvatarFallback(`${firstName} ${lastName}`)}</AvatarFallback>
          </Avatar>
          <p className='text-sm font-medium'>
            {firstName} {lastName}
          </p>
        </div>
      )
    },
    enableColumnFilter: true,
    enableSorting: false,
    size: 240
  },
  {
    id: 'activity',
    accessorFn: (row) => row.verb,
    meta: {
      label: i18next.t('project.activity.columnActivity')
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={i18next.t('project.activity.columnActivity')} />
    ),
    cell: ({ row }) => (
      <p className='text-sm text-foreground/80'>
        {i18next.t(`activities.${row.original.verb}`, { defaultValue: row.original.verb })}
      </p>
    ),
    enableColumnFilter: false,
    enableSorting: false
  },
  {
    id: 'occurredOnUtc',
    accessorKey: 'occurredOnUtc',
    meta: {
      label: i18next.t('project.activity.columnDate'),
      variant: 'dateRange'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={i18next.t('project.activity.columnDate')} className='mx-auto' />
    ),
    cell: ({ row }) => <p className='text-center text-sm'>{formatDate(row.original.occurredOnUtc, 'dateTimeShort')}</p>,
    enableColumnFilter: true,
    enableSorting: false,
    size: 160
  }
]
