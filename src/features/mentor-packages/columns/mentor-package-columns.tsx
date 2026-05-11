import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
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
import { cn, formatCurrency, formatDate } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { CheckCircleIcon, MoreHorizontalIcon, SearchIcon, XCircleIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { MentorPackage } from '../types'
import PinCell from './pin-cell'

export const getColumns = (): ColumnDef<MentorPackage>[] => {
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
      accessorKey: 'name',
      meta: {
        label: 'common.field.name',
        placeholder: 'common.ui.search',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='common.field.name' />,
      cell: ({ row }) => (
        <Link to={`${row.original.id}`} className='hover:underline font-medium truncate'>
          {row.original.name}
        </Link>
      ),
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 300
    },
    {
      id: 'isPin',
      accessorKey: 'isPin',
      meta: {
        label: 'mentorPackage.form.isPin',
        variant: 'radio'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.isPin' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <PinCell row={row} />
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'price',
      accessorKey: 'price',
      meta: {
        label: 'mentorPackage.form.price'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.price' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='font-medium text-primary text-center'>
          {formatCurrency(row.original.price, row.original.currency)}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'sessions',
      accessorKey: 'totalSessions',
      meta: {
        label: 'mentorPackage.form.totalSessions'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.totalSessions' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-sm text-muted-foreground text-center'>
          {i18next.t('mentorPackage.card.sessions', {
            sessions: row.original.totalSessions
          })}
        </p>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'isActive',
      accessorKey: 'isActive',
      meta: {
        label: 'common.field.isActive'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='common.field.isActive' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <div
            className={cn(
              'flex justify-center items-center gap-1 border px-1 py-0.5 w-fit rounded-sm',
              row.original.isActive ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50'
            )}
          >
            {row.original.isActive ? (
              <>
                <CheckCircleIcon className='size-3.5 text-emerald-600' />
                <p className='text-emerald-600 font-medium text-xs'>{i18next.t('common.status.active')}</p>
              </>
            ) : (
              <>
                <XCircleIcon className='size-3.5 text-rose-600' />
                <p className='text-rose-600 font-medium text-xs'>{i18next.t('common.status.inactive')}</p>
              </>
            )}
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'activationDeadlineDays',
      accessorKey: 'activationDeadlineDays',
      meta: {
        label: 'mentorPackage.form.activationDeadlineDays'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.activationDeadlineDays' className='mx-auto' />
      ),
      cell: ({ row }) => <p className='text-muted-foreground text-center'>{row.original.activationDeadlineDays}</p>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'usageDeadlineDays',
      accessorKey: 'usageDeadlineDays',
      meta: {
        label: 'mentorPackage.form.usageDeadlineDays'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.usageDeadlineDays' className='mx-auto' />
      ),
      cell: ({ row }) => <p className='text-muted-foreground text-center'>{row.original.usageDeadlineDays}</p>,
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'common.field.createdOnUtc'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='common.field.createdOnUtc' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground text-center text-sm'>
          {formatDate(row.original.createdOnUtc, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 100
    },
    {
      id: 'modifiedOnUtc',
      accessorKey: 'modifiedOnUtc',
      meta: {
        label: 'common.field.modifiedOnUtc'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='common.field.modifiedOnUtc' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground text-center text-sm'>
          {row.original.modifiedOnUtc
            ? formatDate(row.original.modifiedOnUtc, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
            : i18next.t('common.ui.emptyValue')}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 100
    },
    {
      id: 'actions',

      cell: ({ row }) => {
        const { id } = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`${id}`}>{i18next.t('common.button.edit')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 50
    }
  ]
}
