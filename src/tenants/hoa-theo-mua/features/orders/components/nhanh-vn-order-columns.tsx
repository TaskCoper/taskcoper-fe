import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/date'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import type { NhanhVnOrder } from '../types'

export const getNhanhVnColumns = (): ColumnDef<NhanhVnOrder>[] => {
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
      enableColumnFilter: false,
      size: 40
    },
    {
      id: 'expand',
      cell: ({ row }) => {
        if (!row.original.products?.length) return null
        return (
          <Button
            variant='ghost'
            size='icon'
            className='size-6'
            onClick={() => row.toggleExpanded()}
            aria-label={row.getIsExpanded() ? 'Thu gọn' : 'Xem sản phẩm'}
          >
            {row.getIsExpanded() ? <ChevronDownIcon className='size-4' /> : <ChevronRightIcon className='size-4' />}
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 40
    },
    {
      id: 'id',
      accessorFn: (row) => row.info.id,
      meta: {
        label: 'orders.column.nhanhOrderId',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.nhanhOrderId' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const { id, trackingUrl } = row.original.info
        if (trackingUrl) {
          return (
            <div className='flex justify-center'>
              <a
                href={trackingUrl}
                target='_blank'
                rel='noreferrer'
                className='font-mono text-xs text-black-600 dark:text-black-400 hover:underline'
              >
                {id}
              </a>
            </div>
          )
        }

        return <p className='text-center font-mono text-xs'>{id}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'saleName',
      accessorFn: (row) => row.info.saleName,
      meta: { label: 'orders.column.saleName' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.saleName' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.info.saleName

        return value ? (
          <p className='mx-auto text-center'>{value}</p>
        ) : (
          <p className='mx-auto text-center text-muted-foreground/70 italic'>{i18next.t('orders.common.noData')}</p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'trafficSource',
      accessorFn: (row) => row.channel?.trafficSource,
      meta: { label: 'orders.column.trafficSource' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.trafficSource' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.channel?.trafficSource

        return value ? (
          <div className='flex justify-center'>
            <span className='text-xs bg-blue-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/60 px-2 py-0.5 rounded-full'>
              {value}
            </span>
          </div>
        ) : (
          <p className='mx-auto text-center text-muted-foreground/70 italic'>{i18next.t('orders.common.noData')}</p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'shippingAddress',
      accessorFn: (row) => row.shippingAddress?.address,
      meta: { label: 'orders.column.shippingAddress' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.shippingAddress' />,
      cell: ({ row }) => {
        const { address, location } = row.original.shippingAddress ?? {}

        if (address) {
          return (
            <div className='max-w-52'>
              <p className='truncate'>{address}</p>
              {location && <p className='text-xs text-muted-foreground truncate'>{location}</p>}
            </div>
          )
        } else {
          return (
            <p className='text-muted-foreground/70 italic text-sm select-none'>{i18next.t('orders.common.noData')}</p>
          )
        }
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 240
    },
    {
      id: 'mobile',
      accessorFn: (row) => row.shippingAddress?.mobile,
      meta: { label: 'orders.column.mobile' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.mobile' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.shippingAddress?.mobile

        return value ? (
          <p className='text-center'>{value}</p>
        ) : (
          <p className='text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'carrier',
      accessorFn: (row) => row.carrier?.name,
      meta: { label: 'orders.column.carrier' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.carrier' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.carrier?.name

        return value ? (
          <p className='text-center'>{value}</p>
        ) : (
          <p className='text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'amount',
      accessorFn: (row) => row.payment?.transfer?.amount,
      meta: { label: 'orders.column.amount' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.amount' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.payment?.transfer?.amount

        return value != null ? (
          <p className='text-center font-medium'>{value.toLocaleString('vi-VN')} ₫</p>
        ) : (
          <p className='text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'createdAt',
      accessorFn: (row) => row.info.createdAt,
      meta: { label: 'orders.column.createdAt', variant: 'dateRange' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.createdAt' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.info.createdAt

        return value ? (
          <p className='text-center whitespace-nowrap'>{formatDateTime(value * 1000, 'dateTimeShort')}</p>
        ) : (
          <p className='text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'depot',
      accessorFn: (row) => row.info.depotId,
      meta: { label: 'orders.column.depot' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.depot' className='mx-auto' />,
      cell: ({ row }) => {
        const value = row.original.info.depotId

        return value ? (
          <div className='flex justify-center'>
            <span className='text-xs bg-blue-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/60 px-2 py-0.5 rounded-full'>
              {value}
            </span>
          </div>
        ) : (
          <p className='text-center text-muted-foreground/70 italic text-sm select-none'>
            {i18next.t('orders.common.noData')}
          </p>
        )
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{i18next.t('systemProjects.actions.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{i18next.t('systemProjects.actions.actions')}</DropdownMenuLabel>
            {row.original.info.trackingUrl && (
              <DropdownMenuItem asChild>
                <a href={row.original.info.trackingUrl} target='_blank' rel='noreferrer'>
                  {i18next.t('task.column.viewDetails')}
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 30
    }
  ]
}
