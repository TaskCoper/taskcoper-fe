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
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, MoreHorizontalIcon } from 'lucide-react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import type { VoucherUsage } from '../types'
import { displayDate, formatMoney } from './voucher-date-utils'

export const getVoucherUsageColumns = (t: TenantT): ColumnDef<VoucherUsage>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label={t('configsPage.vouchers.selectAll')}
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={t('configsPage.vouchers.selectRow')}
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
    id: 'customerName',
    accessorKey: 'customerName',
    meta: { label: 'configsPage.vouchers.customer' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.customer' />,
    cell: ({ row }) => row.original.customerName,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 190
  },
  {
    id: 'customerPhone',
    accessorKey: 'customerPhone',
    meta: { label: 'configsPage.vouchers.phone' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.phone' />,
    cell: ({ row }) => row.original.customerPhone,
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'discountAmount',
    accessorKey: 'discountAmount',
    meta: { label: 'configsPage.vouchers.discountAmount' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.discountAmount' />,
    cell: ({ row }) => formatMoney(row.original.discountAmount, t('configsPage.vouchers.currency')),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 170
  },
  {
    id: 'usedAt',
    accessorKey: 'usedAt',
    meta: { label: 'configsPage.vouchers.usedAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.usedAt' />,
    cell: ({ row }) => displayDate(row.original.usedAt),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 170
  },
  {
    id: 'actions',
    meta: { label: 'configsPage.vouchers.actions' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label='configsPage.vouchers.actions' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' aria-label={t('configsPage.vouchers.actions')}>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('configsPage.vouchers.actions')}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${row.original.orderId}`}>
                <EyeIcon className='size-4' />
                {t('configsPage.vouchers.viewOrderDetails')}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 88
  }
]
