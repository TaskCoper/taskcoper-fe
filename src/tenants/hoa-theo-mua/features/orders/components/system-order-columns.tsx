import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
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
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  BadgeCheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  QrCodeIcon,
  SearchIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import { OrderStatus, OrderStatusLabel, OrderStatusStyle, type SystemOrder } from '../types'
import { vndFormatter } from '../utils'

const renderNoData = (t: TenantT) => (
  <span className='text-muted-foreground/60 italic text-sm select-none'>{t('systemOrders.common.noData')}</span>
)

const renderText = (value: string | null, t: TenantT, className?: string) => {
  const text = value?.trim()
  if (!text) return renderNoData(t)

  return <p className={cn('truncate', className)}>{text}</p>
}

// Highlighted currency cell for the order total.
const renderAmount = (value: number | null, t: TenantT) => {
  if (value == null) return <div className='text-right'>{renderNoData(t)}</div>

  return (
    <p className='text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
      {vndFormatter.format(value)}
    </p>
  )
}

// Neutral currency cell for fees.
const renderCurrency = (value: number | null, t: TenantT) => {
  if (value == null) return <div className='text-right'>{renderNoData(t)}</div>

  return <p className='text-right tabular-nums'>{vndFormatter.format(value)}</p>
}

export const getSystemOrderColumns = ({
  t,
  onEdit,
  onConfirmPayment
}: {
  t: TenantT
  onEdit: (order: SystemOrder) => void
  onConfirmPayment: (order: SystemOrder) => void
}): ColumnDef<SystemOrder>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={t('systemOrders.column.selectAll')}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t('systemOrders.column.selectRow')}
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
      id: 'customer',
      accessorFn: (row) => row.fullName,
      meta: {
        label: 'systemOrders.column.customer',
        variant: 'text',
        placeholder: 'systemOrders.filter.searchPlaceholder',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemOrders.column.customer' />,
      cell: ({ row }) => {
        const name = row.original.fullName?.trim()
        const phone = row.original.phone?.trim()
        if (!name && !phone) return renderNoData(t)

        return (
          <Link
            to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${row.original.orderId}`}
            className='group flex max-w-48 flex-col'
          >
            {name && (
              <span className='inline-flex items-center gap-1 truncate font-medium text-primary group-hover:underline'>
                {name}
                <ExternalLinkIcon className='size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100' />
              </span>
            )}
            {phone && <span className='truncate text-xs text-muted-foreground'>{phone}</span>}
          </Link>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 200
    },
    {
      id: 'orderDate',
      accessorFn: (row) => row.createAt,
      meta: { label: 'systemOrders.column.createdAt' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemOrders.column.createdAt' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.createAt
        if (!value) return <div className='text-center'>{renderNoData(t)}</div>

        return <p className='text-center whitespace-nowrap'>{formatDateTime(value, 'dateTimeShort')}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'address',
      accessorFn: (row) => row.address,
      meta: { label: 'systemOrders.column.address' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemOrders.column.address' />,
      cell: ({ row }) => {
        const address = row.original.address?.trim()
        const shortAddress = row.original.shortAddress?.trim()
        if (!address && !shortAddress) return renderNoData(t)

        return (
          <div className='max-w-56'>
            {address && <p className='truncate'>{address}</p>}
            {shortAddress && shortAddress !== address && (
              <p className='truncate text-xs text-muted-foreground'>{shortAddress}</p>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 240
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      meta: { label: 'systemOrders.column.status' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemOrders.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const style = OrderStatusStyle[status] ?? OrderStatusStyle[OrderStatus.Pending]
        const label = OrderStatusLabel[status] ? t(OrderStatusLabel[status]) : status

        return (
          <div className='flex justify-center'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                style.badge
              )}
            >
              <span className={cn('size-1.5 rounded-full', style.dot)} />
              {label}
            </span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'amount',
      accessorFn: (row) => row.totalFee,
      meta: { label: 'systemOrders.column.amount' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemOrders.column.amount' className='ml-auto' />
      ),
      cell: ({ row }) => renderAmount(row.original.totalFee, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    // {
    //   id: 'tracking',
    //   accessorFn: (row) => row.trackNumber,
    //   meta: { label: 'systemOrders.column.tracking' },
    //   header: ({ column }) => <DataTableColumnHeader column={column} label='systemOrders.column.tracking' />,
    //   cell: ({ row }) => {
    //     const { trackNumber, nhanhTrackingUrl } = row.original
    //     const value = trackNumber?.trim()
    //     if (!value) return renderNoData(t)

    //     if (nhanhTrackingUrl?.trim()) {
    //       return (
    //         <a
    //           href={nhanhTrackingUrl}
    //           target='_blank'
    //           rel='noreferrer'
    //           className='group inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline'
    //         >
    //           {value}
    //           <ExternalLinkIcon className='size-3 opacity-0 transition-opacity group-hover:opacity-100' />
    //         </a>
    //       )
    //     }

    //     return <p className='font-mono text-xs'>{value}</p>
    //   },
    //   enableSorting: false,
    //   enableHiding: true,
    //   enableColumnFilter: false,
    //   size: 170
    // },
    {
      id: 'shippingFee',
      accessorFn: (row) => row.shippingFee,
      meta: { label: 'systemOrders.column.shippingFee' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemOrders.column.shippingFee' className='ml-auto' />
      ),
      cell: ({ row }) => renderCurrency(row.original.shippingFee, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'productFee',
      accessorFn: (row) => row.productFee,
      meta: { label: 'systemOrders.column.productFee' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemOrders.column.productFee' className='ml-auto' />
      ),
      cell: ({ row }) => renderCurrency(row.original.productFee, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'invoice',
      accessorFn: (row) => row.isExportInvoice,
      meta: { label: 'systemOrders.column.invoice' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='systemOrders.column.invoice' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const { isExportInvoice, taxCode } = row.original
        if (!isExportInvoice) return <div className='text-center'>{renderNoData(t)}</div>

        return (
          <div className='flex flex-col items-center gap-0.5'>
            <Badge variant='secondary' className='font-normal'>
              {t('systemOrders.invoice.export')}
            </Badge>
            {taxCode?.trim() && <span className='font-mono text-xs text-muted-foreground'>{taxCode.trim()}</span>}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'remarks',
      accessorFn: (row) => row.remarks,
      meta: { label: 'systemOrders.column.remarks' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemOrders.column.remarks' />,
      cell: ({ row }) => renderText(row.original.remarks, t, 'max-w-56'),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 240
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const order = row.original
        const { paymentUrl, qrUrl, trackNumber } = order
        const tracking = trackNumber?.trim()

        return (
          <div className='flex items-center justify-end gap-0.5'>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => onEdit(order)}
              aria-label={t('systemOrders.action.edit')}
            >
              <PencilIcon className='size-3.5' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 p-0'>
                  <span className='sr-only'>{t('systemOrders.action.openMenu')}</span>
                  <MoreHorizontalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>{t('systemOrders.action.actions')}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${order.orderId}`}>
                    <EyeIcon className='size-4' />
                    {t('systemOrders.action.viewDetails')}
                  </Link>
                </DropdownMenuItem>
                {order.status === OrderStatus.Pending && (
                  <DropdownMenuItem onClick={() => onConfirmPayment(order)}>
                    <BadgeCheckIcon className='size-4' />
                    {t('systemOrders.action.confirmPayment')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild disabled={!paymentUrl?.trim()}>
                  <a href={paymentUrl} target='_blank' rel='noreferrer'>
                    <ExternalLinkIcon className='size-4' />
                    {t('systemOrders.action.openPayment')}
                  </a>
                </DropdownMenuItem>
                {qrUrl?.trim() && (
                  <DropdownMenuItem asChild>
                    <a href={qrUrl} target='_blank' rel='noreferrer'>
                      <QrCodeIcon className='size-4' />
                      {t('systemOrders.action.openQr')}
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={!tracking}
                  onClick={async () => {
                    if (!tracking) return
                    await navigator.clipboard.writeText(tracking)
                    toast.success(t('systemOrders.copyTracking.success'))
                  }}
                >
                  <CopyIcon className='size-4' />
                  {t('systemOrders.action.copyTracking')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 72
    }
  ]
}
