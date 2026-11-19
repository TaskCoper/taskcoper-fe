import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { SearchIcon } from 'lucide-react'
import type { ProjectActivity } from '../types'

// i18next.t is strictly typed to the (very large) resource-key union, which TypeScript can fail to
// resolve in a clean build; cast to a loose string-returning helper so the dynamic verb key and the
// static labels compile. Key correctness is still enforced by `yarn i18n:check`.
const t = i18next.t as unknown as (key: string, options?: { defaultValue?: string }) => string

export const getColumns = (): ColumnDef<ProjectActivity>[] => [
  {
    id: 'searchTerm',
    accessorFn: (row) => `${row.actor.firstName} ${row.actor.lastName}`,
    meta: {
      label: 'project.activity.columnActor',
      placeholder: 'project.activity.searchPlaceholder',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label={'project.activity.columnActor'} />,
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
      label: 'project.activity.columnActivity'
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label={'project.activity.columnActivity'} />,
    cell: ({ row }) => (
      <p className='text-sm text-foreground/80'>
        {t(`activities.${row.original.verb}`, { defaultValue: row.original.verb })}
      </p>
    ),
    enableColumnFilter: false,
    enableSorting: false
  },
  {
    id: 'occurredOnUtc',
    accessorKey: 'occurredOnUtc',
    meta: {
      label: 'project.activity.columnDate',
      variant: 'dateRange'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={'project.activity.columnDate'} className='mx-auto' />
    ),
    cell: ({ row }) => <p className='text-center text-sm'>{formatDate(row.original.occurredOnUtc, 'dateTimeShort')}</p>,
    enableColumnFilter: true,
    enableSorting: false,
    size: 160
  }
]
