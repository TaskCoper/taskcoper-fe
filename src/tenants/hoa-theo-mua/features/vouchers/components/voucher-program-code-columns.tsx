import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { SearchIcon } from 'lucide-react'
import type { Voucher } from '../types'
import { formatMoney } from './voucher-date-utils'

export const getVoucherProgramCodeColumns = (
  t: TenantT,
  onToggleActive: (voucher: Voucher, isActive: boolean) => void
): ColumnDef<Voucher>[] => [
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
    id: 'code',
    accessorKey: 'code',
    meta: { label: 'configsPage.vouchers.code', placeholder: 'Nhập mã voucher...', variant: 'text', icon: SearchIcon },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.code' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.code}</span>,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
    size: 220
  },
  {
    id: 'discountValue',
    accessorKey: 'discountValue',
    meta: { label: 'configsPage.vouchers.discountValue' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.discountValue' />,
    cell: ({ row }) =>
      row.original.discountType === 'percent'
        ? `${row.original.discountValue}%`
        : formatMoney(row.original.discountValue, t('configsPage.vouchers.currency')),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'usage',
    accessorFn: (row) => `${row.usedCount}/${row.maxUsageCount}`,
    meta: { label: 'configsPage.vouchers.usage' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.usage' />,
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal tabular-nums'>
        {row.original.usedCount}/{row.original.maxUsageCount}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 130
  },
  {
    id: 'apply',
    meta: { label: 'configsPage.vouchers.apply' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label='configsPage.vouchers.apply' className='justify-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Switch checked={row.original.isActive} onCheckedChange={(value) => onToggleActive(row.original, value)} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 100
  }
]
