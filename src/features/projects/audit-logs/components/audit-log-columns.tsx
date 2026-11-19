import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { SearchIcon } from 'lucide-react'
import AuditLogDetailDialog from './audit-log-detail-dialog'
import type { AuditLog } from '../types'

export const getColumns = (): ColumnDef<AuditLog>[] => [
  {
    id: 'searchTerm',
    accessorFn: (row) => (row.actor ? `${row.actor.firstName} ${row.actor.lastName}` : ''),
    meta: {
      label: i18next.t('project.auditLog.columnActor'),
      placeholder: i18next.t('project.auditLog.searchPlaceholder'),
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label={i18next.t('project.auditLog.columnActor')} />,
    cell: ({ row }) => {
      const actor = row.original.actor

      if (!actor) {
        return <p className='text-sm text-muted-foreground'>{i18next.t('project.auditLog.systemActor')}</p>
      }

      return (
        <div className='flex items-center gap-3'>
          <Avatar className='size-8'>
            <AvatarImage src={actor.avatar ?? ''} />
            <AvatarFallback>{getAvatarFallback(`${actor.firstName} ${actor.lastName}`)}</AvatarFallback>
          </Avatar>
          <p className='text-sm font-medium'>
            {actor.firstName} {actor.lastName}
          </p>
        </div>
      )
    },
    enableColumnFilter: true,
    enableSorting: false,
    size: 240
  },
  {
    id: 'action',
    accessorFn: (row) => row.action,
    meta: {
      label: i18next.t('project.auditLog.columnAction')
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={i18next.t('project.auditLog.columnAction')} />
    ),
    cell: ({ row }) => (
      <p className='text-sm text-foreground/80'>
        {i18next.t(`project.auditLog.actions.${row.original.action}`, { defaultValue: row.original.action })}
      </p>
    ),
    enableColumnFilter: false,
    enableSorting: false
  },
  {
    id: 'entityType',
    accessorFn: (row) => row.entityType,
    meta: {
      label: i18next.t('project.auditLog.columnEntity')
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={i18next.t('project.auditLog.columnEntity')} />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal'>
        {i18next.t(`project.auditLog.entities.${row.original.entityType}`, { defaultValue: row.original.entityType })}
      </Badge>
    ),
    enableColumnFilter: false,
    enableSorting: false,
    size: 160
  },
  {
    id: 'occurredOnUtc',
    accessorKey: 'occurredOnUtc',
    meta: {
      label: i18next.t('project.auditLog.columnDate'),
      variant: 'dateRange'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label={i18next.t('project.auditLog.columnDate')} className='mx-auto' />
    ),
    cell: ({ row }) => <p className='text-center text-sm'>{formatDate(row.original.occurredOnUtc, 'dateTimeShort')}</p>,
    enableColumnFilter: true,
    enableSorting: false,
    size: 170
  },
  {
    id: 'details',
    meta: {
      label: i18next.t('project.auditLog.columnDetails')
    },
    header: () => <span className='sr-only'>{i18next.t('project.auditLog.columnDetails')}</span>,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <AuditLogDetailDialog auditLog={row.original} />
      </div>
    ),
    enableColumnFilter: false,
    enableSorting: false,
    size: 120
  }
]
