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
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  SearchIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import { resolveNhanhOrderStatus } from '../nhanh-order-status'
import type { Order } from '../types'
import { numberFormatter, vndFormatter } from '../utils'

const renderNoData = (t: TenantT) => (
  <span className='text-muted-foreground/60 italic text-sm select-none'>{t('orders.common.noData')}</span>
)

const renderText = (value: string | null, t: TenantT, className?: string) => {
  const text = value?.trim()
  if (!text) return renderNoData(t)

  return <p className={cn('truncate', className)}>{text}</p>
}

const renderAmount = (value: number | null, t: TenantT) => {
  if (value == null) return <div className='text-right'>{renderNoData(t)}</div>

  return (
    <p className='text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400'>
      {vndFormatter.format(value)}
    </p>
  )
}

// Neutral currency cell for fees/discounts (as opposed to the highlighted order total).
const renderCurrency = (value: number | null, t: TenantT) => {
  if (value == null) return <div className='text-right'>{renderNoData(t)}</div>

  return <p className='text-right tabular-nums'>{vndFormatter.format(value)}</p>
}

// Profit can be negative - tint accordingly so losses stand out.
const renderProfit = (value: number | null, t: TenantT) => {
  if (value == null) return <div className='text-right'>{renderNoData(t)}</div>

  return (
    <p
      className={cn(
        'text-right font-medium tabular-nums',
        value < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
      )}
    >
      {vndFormatter.format(value)}
    </p>
  )
}

const renderNumber = (value: number | null, t: TenantT) => {
  if (value == null) return <div className='text-right'>{renderNoData(t)}</div>

  return <p className='text-right tabular-nums'>{numberFormatter.format(value)}</p>
}

const renderDateCell = (value: string | null, t: TenantT) => {
  if (!value) return <div className='text-center'>{renderNoData(t)}</div>

  return <p className='text-center whitespace-nowrap'>{formatDateTime(value, 'dateTimeShort')}</p>
}

const renderBadgeCell = (value: string | null, t: TenantT) => {
  const text = value?.trim()
  if (!text) return <div className='text-center'>{renderNoData(t)}</div>

  return (
    <div className='flex justify-center'>
      <Badge variant='secondary' className='font-normal whitespace-nowrap'>
        {text}
      </Badge>
    </div>
  )
}

export const getColumns = ({ t }: { t: TenantT }): ColumnDef<Order>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={t('orders.column.selectAll')}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t('orders.column.selectRow')}
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
      header: () => null,
      cell: ({ row }) => {
        if (!row.original.orderNhanhVnDetails?.length) return null

        return (
          <Button
            variant='ghost'
            size='icon'
            className='size-6'
            onClick={() => row.toggleExpanded()}
            aria-label={t(row.getIsExpanded() ? 'orders.action.collapseProducts' : 'orders.action.showProducts')}
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
      id: 'orderId',
      accessorFn: (row) => row.idDonHangNhanh,
      meta: { label: 'orders.column.nhanhOrderId', variant: 'text', icon: SearchIcon },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.nhanhOrderId' />,
      cell: ({ row }) => {
        const value = row.original.idDonHangNhanh?.trim()
        if (!value) return renderNoData(t)

        // Navigate by the internal Guid (row.original.id), not the Nhanh order number.
        return (
          <Link
            to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/${row.original.id}`}
            className='group inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline'
          >
            {value}
            <ExternalLinkIcon className='size-3 opacity-0 transition-opacity group-hover:opacity-100' />
          </Link>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 130
    },
    {
      id: 'orderDate',
      accessorFn: (row) => row.thoiGianDonHang,
      meta: { label: 'orders.column.createdAt' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.createdAt' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.thoiGianDonHang
        if (!value) return <div className='text-center'>{renderNoData(t)}</div>

        return <p className='text-center whitespace-nowrap'>{formatDateTime(value, 'dateTimeShort')}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'customer',
      accessorFn: (row) => row.tenKhachHang,
      meta: { label: 'orders.column.customer' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.customer' />,
      cell: ({ row }) => {
        const { tenKhachHang, soDienThoaiKhachHang } = row.original
        const name = tenKhachHang?.trim()
        const phone = soDienThoaiKhachHang?.trim()
        if (!name && !phone) return renderNoData(t)

        return (
          <div className='flex max-w-48 flex-col'>
            {name && <span className='truncate font-medium'>{name}</span>}
            {phone && <span className='truncate text-xs text-muted-foreground'>{phone}</span>}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 180
    },
    {
      id: 'shippingAddress',
      accessorFn: (row) => row.diaChiKhachHang,
      meta: { label: 'orders.column.shippingAddress' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.shippingAddress' />,
      cell: ({ row }) => {
        const { diaChiKhachHang, phuongXaKhachHang, quanHuyenKhachHang, thanhPhoKhachHang } = row.original
        const address = diaChiKhachHang?.trim()
        const area = [phuongXaKhachHang, quanHuyenKhachHang, thanhPhoKhachHang]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(', ')

        if (!address && !area) return renderNoData(t)

        return (
          <div className='max-w-56'>
            {address && <p className='truncate'>{address}</p>}
            {area && <p className='truncate text-xs text-muted-foreground'>{area}</p>}
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
      accessorFn: (row) => row.trangThaiDonHang,
      meta: { label: 'orders.column.status' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = resolveNhanhOrderStatus(row.original.trangThaiDonHang, t)
        if (!status) return <div className='text-center'>{renderNoData(t)}</div>

        return (
          <div className='flex justify-center'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                status.badge
              )}
            >
              <span className={cn('size-1.5 rounded-full', status.dot)} />
              {status.label}
            </span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 160
    },
    {
      id: 'amount',
      accessorFn: (row) => row.giaTriDonHang,
      meta: { label: 'orders.column.amount' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.amount' className='ml-auto' />
      ),
      cell: ({ row }) => renderAmount(row.original.giaTriDonHang, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'carrier',
      accessorFn: (row) => row.hangVanChuyen,
      meta: { label: 'orders.column.carrier' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.carrier' />,
      cell: ({ row }) => {
        const { hangVanChuyen, dichVuVanChuyen } = row.original
        const carrier = hangVanChuyen?.trim()
        const service = dichVuVanChuyen?.trim()
        if (!carrier && !service) return renderNoData(t)

        return (
          <div className='flex max-w-40 flex-col'>
            {carrier && <span className='truncate'>{carrier}</span>}
            {service && <span className='truncate text-xs text-muted-foreground'>{service}</span>}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 160
    },
    {
      id: 'salesStaff',
      accessorFn: (row) => row.nhanVienBanHang,
      meta: { label: 'orders.column.saleName' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.saleName' />,
      cell: ({ row }) => renderText(row.original.nhanVienBanHang, t, 'max-w-40'),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'depot',
      accessorFn: (row) => row.khoTaoDon,
      meta: { label: 'orders.column.depot' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.depot' className='mx-auto' />,
      cell: ({ row }) => {
        const value = row.original.khoTaoDon?.trim()
        if (!value) return <div className='text-center'>{renderNoData(t)}</div>

        return (
          <div className='flex justify-center'>
            <Badge variant='secondary' className='font-normal'>
              {value}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'source',
      accessorFn: (row) => row.nguon,
      meta: { label: 'orders.column.source' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.source' />,
      cell: ({ row }) => renderText(row.original.nguon ?? row.original.nguonDonHang, t, 'max-w-36'),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'orderType',
      accessorFn: (row) => row.loaiDon,
      meta: { label: 'orders.column.orderType' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.orderType' className='mx-auto' />
      ),
      cell: ({ row }) => renderBadgeCell(row.original.loaiDon, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'trackingCode',
      accessorFn: (row) => row.maVanDon,
      meta: { label: 'orders.column.trackingCode' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.trackingCode' />,
      cell: ({ row }) => {
        const value = row.original.maVanDon?.trim()
        if (!value) return renderNoData(t)

        return <p className='font-mono text-xs'>{value}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'customerCare',
      accessorFn: (row) => row.nhanVienChamSocKhachHang,
      meta: { label: 'orders.column.customerCare' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.customerCare' />,
      cell: ({ row }) => renderText(row.original.nhanVienChamSocKhachHang, t, 'max-w-40'),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'shippingFee',
      accessorFn: (row) => row.phiVanChuyen,
      meta: { label: 'orders.column.shippingFee' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.shippingFee' className='ml-auto' />
      ),
      cell: ({ row }) => renderCurrency(row.original.phiVanChuyen, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'discount',
      accessorFn: (row) => row.tienChietKhau,
      meta: { label: 'orders.column.discount' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.discount' className='ml-auto' />
      ),
      cell: ({ row }) => renderCurrency(row.original.tienChietKhau, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'profit',
      accessorFn: (row) => row.loiNhuan,
      meta: { label: 'orders.column.profit' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.profit' className='ml-auto' />
      ),
      cell: ({ row }) => renderProfit(row.original.loiNhuan, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'weight',
      accessorFn: (row) => row.tongKhoiLuong,
      meta: { label: 'orders.column.weight' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.weight' className='ml-auto' />
      ),
      cell: ({ row }) => renderNumber(row.original.tongKhoiLuong, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 110
    },
    {
      id: 'reconciliation',
      accessorFn: (row) => row.trangThaiDoiSoat,
      meta: { label: 'orders.column.reconciliation' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.reconciliation' className='mx-auto' />
      ),
      cell: ({ row }) => renderBadgeCell(row.original.trangThaiDoiSoat, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'completedAt',
      accessorFn: (row) => row.ngayThanhCong,
      meta: { label: 'orders.column.completedAt' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='orders.column.completedAt' className='mx-auto' />
      ),
      cell: ({ row }) => renderDateCell(row.original.ngayThanhCong, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 150
    },
    {
      id: 'customerNote',
      accessorFn: (row) => row.ghiChuCuaKhach,
      meta: { label: 'orders.column.customerNote' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='orders.column.customerNote' />,
      cell: ({ row }) => renderText(row.original.ghiChuCuaKhach, t, 'max-w-56'),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 240
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const orderId = row.original.idDonHangNhanh?.trim()

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{t('orders.action.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{t('orders.action.actions')}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/${row.original.id}`}>
                  <ExternalLinkIcon className='size-4' />
                  {t('orders.action.viewDetails')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!orderId}
                onClick={async () => {
                  if (!orderId) return
                  await navigator.clipboard.writeText(orderId)
                  toast.success(t('orders.copyOrderId.success'))
                }}
              >
                <CopyIcon className='size-4' />
                {t('orders.action.copyOrderId')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 40
    }
  ]
}
