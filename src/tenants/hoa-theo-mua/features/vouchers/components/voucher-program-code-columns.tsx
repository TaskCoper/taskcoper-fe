import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { Copy, MoreHorizontal, SearchIcon } from 'lucide-react'
import type { ProgramVoucherItem } from '../types'
import { displayDateTime, formatMoney, isUnlimitedAmount } from './voucher-date-utils'
import { VoucherDescription } from './voucher-description'
import { toast } from 'sonner'

export const getVoucherProgramCodeColumns = (
  t: TenantT,
  onToggleActive: (voucher: ProgramVoucherItem, isActive: boolean) => void
): ColumnDef<ProgramVoucherItem>[] => [
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
    meta: {
      label: 'configsPage.vouchers.code',
      placeholder: 'configsPage.vouchers.codeSearch',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.code' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.code}</span>,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
    size: 220
  },
  {
    id: 'description',
    accessorKey: 'description',
    meta: { label: 'configsPage.vouchers.description' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.description' />,
    cell: ({ row }) => (
      <VoucherDescription
        description={row.original.description}
        label={t('configsPage.vouchers.description')}
        emptyLabel='—'
        className='text-sm'
      />
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 220
  },
  {
    id: 'discountType',
    accessorKey: 'discountType',
    meta: { label: 'configsPage.vouchers.discountType' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.discountType' />,
    cell: ({ row }) => (
      <Badge variant='outline' className='whitespace-nowrap font-normal'>
        {row.original.discountType === 'percent'
          ? t('configsPage.vouchers.kinds.percent')
          : t('configsPage.vouchers.kinds.cash')}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 170
  },
  {
    id: 'discountValue',
    accessorKey: 'discountValue',
    meta: { label: 'configsPage.vouchers.discountValue' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.discountValue' />,
    cell: ({ row }) => (
      <Badge variant='secondary' className='whitespace-nowrap font-normal'>
        {row.original.discountType === 'percent'
          ? `${row.original.discountValue}%`
          : formatMoney(row.original.discountValue, t('configsPage.vouchers.currency'))}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'maxDiscountAmount',
    accessorKey: 'maxDiscountAmount',
    meta: { label: 'configsPage.vouchers.maxDiscountAmount' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.maxDiscountAmount' />,
    cell: ({ row }) => (
      <Badge variant='outline' className='whitespace-nowrap font-normal'>
        {isUnlimitedAmount(row.original.maxDiscountAmount)
          ? t('configsPage.vouchers.unlimited')
          : formatMoney(row.original.maxDiscountAmount, t('configsPage.vouchers.currency'))}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 160
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
    id: 'createdAt',
    accessorKey: 'createdAt',
    meta: { label: 'configsPage.vouchers.createdAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.createdAt' />,
    cell: ({ row }) => <span className='whitespace-nowrap text-sm'>{displayDateTime(row.original.createdAt)}</span>,
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 170
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    meta: { label: 'configsPage.vouchers.updatedAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.updatedAt' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm'>
        {row.original.updatedAt ? displayDateTime(row.original.updatedAt) : '—'}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 170
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
              <MoreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(row.original.code)
                  toast.success(t('configsPage.vouchers.copyCodeSuccess'))
                } catch {
                  toast.error(t('configsPage.vouchers.copyCodeError'))
                }
              }}
            >
              <Copy className='size-4' />
              {t('configsPage.vouchers.copyCode')}
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
