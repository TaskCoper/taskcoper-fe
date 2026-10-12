import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, RefreshCw, SearchIcon, Trash2 } from 'lucide-react'
import type { VoucherProgram } from '../types'
import { displayValidityPeriod, formatMoney, isUnlimitedAmount } from './voucher-date-utils'

const renderOrderAmount = (value: number | null, currency: string, unlimited: string) => (
  <Badge variant='outline' className='whitespace-nowrap font-normal'>
    {isUnlimitedAmount(value) ? unlimited : formatMoney(value, currency)}
  </Badge>
)

interface VoucherProgramColumnsOptions {
  t: TenantT
  onToggleActive: (program: VoucherProgram, isActive: boolean) => void
  onViewDetail: (program: VoucherProgram) => void
  onGenerate: (program: VoucherProgram) => void
  onEdit: (program: VoucherProgram) => void
  onDelete: (program: VoucherProgram) => void
}

export const getVoucherProgramColumns = ({
  t,
  onToggleActive,
  onViewDetail,
  onGenerate,
  onEdit,
  onDelete
}: VoucherProgramColumnsOptions): ColumnDef<VoucherProgram>[] => [
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
    id: 'name',
    accessorKey: 'name',
    meta: {
      label: 'configsPage.vouchers.programName',
      placeholder: 'configsPage.vouchers.programSearch',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.programName' />,
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
    size: 220
  },
  {
    id: 'validityPeriod',
    accessorFn: (row) => row.startAt,
    meta: { label: 'configsPage.vouchers.validityPeriod' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.validityPeriod' />,
    cell: ({ row }) => (
      <Badge variant='outline' className='whitespace-nowrap font-normal'>
        {displayValidityPeriod(row.original.startAt, row.original.endAt, t('configsPage.vouchers.unlimited'))}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 220
  },
  {
    id: 'voucherCount',
    accessorKey: 'voucherCount',
    meta: { label: 'configsPage.vouchers.voucherCount' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.voucherCount' />,
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal tabular-nums'>
        {row.original.voucherCount}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 130
  },
  {
    id: 'usedVoucherCount',
    accessorKey: 'usedVoucherCount',
    meta: { label: 'configsPage.vouchers.usedVoucherCount' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.usedVoucherCount' />,
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-normal tabular-nums'>
        {row.original.usedVoucherCount}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'minOrderAmount',
    accessorKey: 'minOrderAmount',
    meta: { label: 'configsPage.vouchers.minOrderAmount' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.minOrderAmount' />,
    cell: ({ row }) =>
      renderOrderAmount(
        row.original.minOrderAmount,
        t('configsPage.vouchers.currency'),
        t('configsPage.vouchers.unlimited')
      ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'maxOrderAmount',
    accessorKey: 'maxOrderAmount',
    meta: { label: 'configsPage.vouchers.maxOrderAmount' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='configsPage.vouchers.maxOrderAmount' />,
    cell: ({ row }) =>
      renderOrderAmount(
        row.original.maxOrderAmount,
        t('configsPage.vouchers.currency'),
        t('configsPage.vouchers.unlimited')
      ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
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
            <DropdownMenuItem onClick={() => onViewDetail(row.original)}>
              <Eye className='size-4' />
              {t('configsPage.vouchers.viewProgramDetail')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerate(row.original)}>
              <RefreshCw className='size-4' />
              {t('configsPage.vouchers.generate')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className='size-4' />
              {t('configsPage.vouchers.editProgram')}
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => onDelete(row.original)}>
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
