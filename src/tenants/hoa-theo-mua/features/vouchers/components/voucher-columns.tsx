import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { History, MoreHorizontal, Pencil, SearchIcon, Trash2 } from 'lucide-react'
import type { Voucher } from '../types'
import { displayDate } from './voucher-date-utils'

interface VoucherColumnsOptions {
  t: TenantT
  onEdit: (voucher: Voucher) => void
  onViewUsage: (voucher: Voucher) => void
  onToggleActive: (voucher: Voucher, isActive: boolean) => void
  onDelete: (voucherId: string) => void
}

export const getVoucherColumns = ({
  t,
  onEdit,
  onViewUsage,
  onToggleActive,
  onDelete
}: VoucherColumnsOptions): ColumnDef<Voucher>[] => [
  {
    id: 'code',
    accessorKey: 'code',
    meta: {
      label: 'configsPage.vouchers.code',
      placeholder: 'Nhập để tìm kiếm...',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.code' />,
    cell: ({ row }) => (
      <div className='min-w-36'>
        <p className='font-medium'>{row.original.code}</p>
        <p className='text-xs text-muted-foreground'>{row.original.description}</p>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
    size: 220
  },
  {
    id: 'visibility',
    accessorKey: 'visibility',
    meta: {
      label: 'configsPage.vouchers.voucherType',
      variant: 'radio',
      options: [
        { label: t('configsPage.vouchers.types.public'), value: 'public' },
        { label: t('configsPage.vouchers.types.private'), value: 'private' }
      ]
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.voucherType' />,
    cell: ({ row }) =>
      row.original.visibility === 'public'
        ? t('configsPage.vouchers.types.public')
        : t('configsPage.vouchers.types.private'),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 150
  },
  {
    id: 'discountValue',
    accessorKey: 'discountValue',
    meta: { label: 'configsPage.vouchers.discountValue' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.discountValue' />,
    cell: ({ row }) =>
      `${row.original.discountValue}${row.original.discountType === 'percent' ? '%' : ` ${t('configsPage.vouchers.currency')}`}`,
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
    id: 'validityPeriod',
    accessorFn: (row) => row.startAt,
    meta: { label: 'configsPage.vouchers.validityPeriod' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.validityPeriod' />,
    cell: ({ row }) => (
      <Badge variant='outline' className='whitespace-nowrap font-normal'>
        {displayDate(row.original.startAt)} - {displayDate(row.original.endAt)}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 210
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
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className='size-4' />
              {t('configsPage.vouchers.editTitle')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewUsage(row.original)}>
              <History className='size-4' />
              {t('configsPage.vouchers.usageHistory')}
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => onDelete(row.original.id)}>
              <Trash2 className='size-4' />
              {t('configsPage.vouchers.remove')}
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
