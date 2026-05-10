import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn, getAvatarFallback, getColorTextClass } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import i18next from 'i18next'
import { MoreHorizontalIcon, SearchIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { RevenueType, RevenueTypeLabel, type Revenue } from '../types'

interface GetColumnsProps {
  onDeleteRevenue?: (id: string, revenueName: string) => void
  onEditRevenue?: (revenue: Revenue) => void
  canUpdate?: boolean
  canDelete?: boolean
}

export const getColumns = ({
  onDeleteRevenue,
  onEditRevenue,
  canUpdate = true,
  canDelete = true
}: GetColumnsProps): ColumnDef<Revenue>[] => {
  const columns: ColumnDef<Revenue>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={i18next.t('projectRevenue.column.selectAll')}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={i18next.t('projectRevenue.column.selectRow')}
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
        label: 'projectRevenue.column.name',
        placeholder: 'projectRevenue.column.namePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectRevenue.column.name' />,
      cell: ({ row }) => <p className='w-full truncate max-w-75 font-medium'>{row.original.name}</p>,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 200
    },
    {
      id: 'type',
      accessorKey: 'type',
      meta: {
        label: 'projectRevenue.column.type',
        variant: 'radio'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='projectRevenue.column.type' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const type = row.original.type
        const isCashIn = type === RevenueType.Revenue

        return (
          <div className='flex justify-center'>
            <div
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                isCashIn
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              )}
            >
              {isCashIn ? <TrendingUpIcon className='size-3' /> : <TrendingDownIcon className='size-3' />}
              {i18next.t(RevenueTypeLabel[type])}
            </div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      meta: {
        label: 'projectRevenue.column.amount'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='projectRevenue.column.amount' className='flex mr-auto' />
      ),
      cell: ({ row }) => {
        const amount = row.original.amount
        const isCashIn = row.original.type === RevenueType.Revenue
        const formatted = new Intl.NumberFormat(i18next.language === 'vi' ? 'vi-VN' : 'en-US', {
          style: 'currency',
          currency: 'VND'
        }).format(amount)

        return (
          <p
            className={cn(
              'text-left font-semibold tabular-nums',
              isCashIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {isCashIn ? '+' : '-'}
            {formatted}
          </p>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'balanceAfter',
      accessorKey: 'balanceAfter',
      meta: {
        label: 'projectRevenue.column.balanceAfter'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='projectRevenue.column.balanceAfter' className='flex mr-auto' />
      ),
      cell: ({ row }) => {
        const balance = row.original.balanceAfter
        const formatted = new Intl.NumberFormat(i18next.language === 'vi' ? 'vi-VN' : 'en-US', {
          style: 'currency',
          currency: 'VND'
        }).format(balance)

        return <p className='text-left font-medium tabular-nums text-muted-foreground'>{formatted}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'labels',
      accessorKey: 'labels',
      meta: {
        label: 'projectRevenue.column.labels',
        variant: 'multiSelect'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectRevenue.column.labels' />,
      cell: ({ row }) => {
        if (row.original.labels.length === 0)
          return <p className='text-muted-foreground'>{i18next.t('projectRevenue.column.noLabels')}</p>

        return (
          <div className='flex items-center gap-1 flex-wrap'>
            {row.original.labels.map((label) => (
              <div
                key={label.id}
                className={cn('rounded-sm h-5 min-w-10 px-2 flex justify-center items-center', label.color)}
              >
                <p className={cn('text-xs font-medium', getColorTextClass(label.color))}>{label.name}</p>
              </div>
            ))}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 180
    },
    {
      id: 'createdBy',
      accessorFn: (row) => `${row.createdBy.firstName} ${row.createdBy.lastName}`,
      meta: {
        label: 'projectRevenue.column.createdBy'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectRevenue.column.createdBy' />,
      cell: ({ row }) => {
        const creator = row.original.createdBy

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-6 ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={creator.avatar || undefined} />
              <AvatarFallback className='text-[10px]'>
                {getAvatarFallback(`${creator.firstName} ${creator.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className='-space-y-0.5'>
              <p className='font-medium'>
                {creator.firstName} {creator.lastName}
              </p>
              <p className='text-xs text-muted-foreground'>{creator.email}</p>
            </div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'projectRevenue.column.createdDate',
        variant: 'dateRange'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='projectRevenue.column.createdDate' className='mx-auto' />
      ),
      cell: ({ row }) => {
        if (row.original.createdOnUtc) {
          return (
            <p className='text-center text-muted-foreground'>
              {format(new Date(row.original.createdOnUtc), 'dd/MM/yyyy', {
                locale: i18next.language === 'vi' ? vi : undefined
              })}
            </p>
          )
        }

        return <p className='text-center text-muted-foreground'>{i18next.t('projectRevenue.column.none')}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, name } = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('projectRevenue.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('projectRevenue.actions.actions')}</DropdownMenuLabel>
              {canUpdate ? (
                <DropdownMenuItem onClick={() => onEditRevenue?.(row.original)}>
                  {i18next.t('projectRevenue.actions.edit')}
                </DropdownMenuItem>
              ) : null}

              {canDelete ? (
                <DropdownMenuItem className='focus:text-destructive' onClick={() => onDeleteRevenue?.(id, name)}>
                  {i18next.t('projectRevenue.actions.delete')}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    }
  ]

  return canUpdate || canDelete ? columns : columns.filter((col) => col.id !== 'actions')
}
