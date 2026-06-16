import type { ColumnDef } from '@tanstack/react-table'
import { OrderStatus, OrderStatusLabel, type OrderRow } from '../types'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Link } from 'react-router'
import { cn } from '@/shared/utils'
import i18next from 'i18next'
import { formatDateTime } from '@/lib/date'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export const getColumns = (): ColumnDef<OrderRow>[] => {
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
      id: 'orderId',
      accessorKey: 'orderId',
      meta: {
        label: 'task.column.card',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.orderId' />,
      cell: ({ row }) => <p className='w-full truncate max-w-125 xl:max-w-none'>{row.original.orderId}</p>,
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 60
    },
    {
      id: 'nhanhOrderId',
      accessorKey: 'nhanhOrderId',
      meta: { label: 'orders.column.nhanhOrderId' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.nhanhOrderId' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.nhanhOrderId

        if (value) {
          return <p className='mx-auto text-center w-full truncate max-w-125 xl:max-w-none'>{value}</p>
        }

        return (
          <p className=' mx-auto text-center text-muted-foreground/70 italic '>{i18next.t('orders.common.noData')}</p>
        )
      },
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 50
    },
    {
      id: 'nhanhTrackingUrl',
      accessorKey: 'nhanhTrackingUrl',
      meta: {
        label: 'orders.column.nhanhTrackingUrl'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.nhanhTrackingUrl' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const url = row.original.nhanhTrackingUrl

        if (url) {
          return (
            <Link
              to={url}
              className={cn('hover:underline text-blue-600 dark:text-blue-400')}
              // className={cn(
              // 'hover:underline',
              // )}
            >
              <p className='mx-auto text-center w-full truncate max-w-125 xl:max-w-none'>{url}</p>
            </Link>
          )
        }

        return (
          <p className='mx-auto text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 50
    },
    {
      id: 'ahahaMoveOrderId',
      accessorKey: 'ahahaMoveOrderId',
      meta: {
        label: 'orders.column.ahahaMoveOrderId'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.ahahaMoveOrderId' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.ahahaMoveOrderId

        if (value) {
          return <p className=' mx-auto text-center w-full truncate max-w-125 xl:max-w-none'>{value}</p>
        }

        return (
          <p className=' mx-auto text-center text-muted-foreground/70 italic'>{i18next.t('orders.common.noData')}</p>
        )
      },
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 50
    },
    {
      id: 'AhahaMoveTrackingUrl',
      accessorKey: 'ahahaMoveTrackingUrl',
      meta: {
        label: 'orders.column.ahahaMoveTrackingUrl'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.ahahaMoveTrackingUrl' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const url = row.original.ahahaMoveTrackingUrl

        if (url) {
          return (
            <Link
              to={url}
              className={cn('hover:underline text-blue-600 dark:text-blue-400')}
              // className={cn(
              // 'hover:underline',
              // )}
            >
              <p className=' mx-auto text-center w-full truncate max-w-125 xl:max-w-none'>{url}</p>
            </Link>
          )
        }

        return (
          <p className='mx-auto text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 50
    },
    {
      id: 'createAt',
      accessorKey: 'createAt',
      meta: { label: 'task.column.startDate', variant: 'dateRange' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='task.column.startDate' className='mx-auto' />
      ),
      cell: ({ row }) => {
        if (row.original.createAt) {
          return <p className='text-center'>{formatDateTime(row.original.createAt, 'dateLong')}</p>
        }

        return <p className='text-center text-muted-foreground'>{i18next.t('task.column.notStarted')}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: {
        label: 'orders.column.status',
        variant: 'radio',
        options: [
          {
            label: i18next.t(OrderStatusLabel[OrderStatus.Pending]),
            value: OrderStatus.Pending
          },
          {
            label: i18next.t(OrderStatusLabel[OrderStatus.Paid]),
            value: OrderStatus.Paid
          }
        ]
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.status' className='text-center mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status

        const statusStyles =
          {
            [OrderStatus.Paid]:
              'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-400',
            [OrderStatus.Pending]:
              'border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-400'
          }[status] || 'border-border bg-muted/50 text-muted-foreground'

        return (
          <div className='flex justify-center items-center'>
            <span
              className={cn(
                'inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded border select-none tracking-wide transition-colors',
                statusStyles
              )}
            >
              {i18next.t(OrderStatusLabel[status])}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 50
    },
    {
      id: 'actions',
      cell: ({ row }) => {
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

              <DropdownMenuItem asChild>
                <Link to={row.original.orderId}>{i18next.t('task.column.viewDetails')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 30
    }
  ]
}
