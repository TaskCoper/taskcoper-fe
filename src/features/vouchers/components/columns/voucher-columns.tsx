import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/date'
import { cn, formatCurrency } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { CopyIcon, MoreHorizontalIcon, SearchIcon, TicketPercentIcon, Trash2Icon } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { DiscountType, DiscountTypeLabel, Scope, ScopeLabel, type VoucherRow } from '../../types'

interface VoucherColumnsProps {
  onDelete: ({ voucherId, voucherCode }: { voucherId: string; voucherCode: string }) => void
  isDeletingVoucher: boolean
}

export const getColumns = ({ onDelete, isDeletingVoucher }: VoucherColumnsProps): ColumnDef<VoucherRow>[] => {
  return [
    {
      id: 'code',
      accessorKey: 'code',
      meta: {
        label: 'voucher.column.code',
        placeholder: 'voucher.column.codePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='voucher.column.code' />,
      cell: ({ row }) => (
        <Link to={row.original.id}>
          <Badge variant='outline' className='rounded-md hover:bg-muted hover:underline cursor-pointer'>
            <TicketPercentIcon className='size-4 text-primary' />
            <p className='font-mono font-medium text-sm'>{row.original.code}</p>
          </Badge>
        </Link>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      enableHiding: false
    },
    {
      id: 'name',
      accessorKey: 'name',
      meta: { label: 'voucher.column.name' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='voucher.column.name' />,
      cell: ({ row }) => (
        <p className='max-w-50 truncate' title={row.original.name}>
          {row.original.name}
        </p>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      id: 'discountType',
      accessorKey: 'discountType',
      meta: { label: 'voucher.column.discountType', variant: 'radio' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.discountType' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-center text-xs font-medium text-muted-foreground'>
          {i18next.t(DiscountTypeLabel[row.original.discountType])}
        </p>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      enableHiding: true
    },
    {
      id: 'discount',
      meta: { label: 'voucher.column.discount' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.discount' className='flex justify-center' />
      ),
      cell: ({ row }) => {
        const { discountType, discountValue } = row.original
        let text = ''
        if (discountType === DiscountType.Percentage) {
          text = `${discountValue}%`
        } else {
          text = formatCurrency(discountValue)
        }
        return <p className='text-center'>{text}</p>
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      id: 'usage',
      meta: { label: 'voucher.column.usage' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.usage' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-center'>
          {row.original.usedCount} / {row.original.totalUsageLimit}
        </p>
      ),
      enableSorting: false
    },
    {
      id: 'status',
      accessorKey: 'isActive',
      meta: { label: 'voucher.column.status', variant: 'radio' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const now = new Date()
        const end = new Date(row.original.endsAtUtc)
        const isExpired = now > end

        if (isExpired) {
          return (
            <Badge variant='outline' className='mx-auto flex w-fit rounded-md'>
              {i18next.t('voucher.column.expired')}
            </Badge>
          )
        }

        if (row.original.isActive) {
          return (
            <Badge variant='default' className='mx-auto flex w-fit bg-green-500 hover:bg-green-600 rounded-md'>
              {i18next.t('voucher.column.active')}
            </Badge>
          )
        }

        return (
          <Badge variant='destructive' className='mx-auto flex w-fit rounded-md'>
            {i18next.t('voucher.column.inactive')}
          </Badge>
        )
      },
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'scope',
      accessorKey: 'scope',
      meta: { label: 'voucher.column.scope', variant: 'radio' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.scope' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-center text-xs font-medium text-muted-foreground'>
          {i18next.t(ScopeLabel[row.original.scope])}
        </p>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      enableHiding: true
    },
    {
      id: 'targets',
      accessorKey: 'targets',
      meta: { label: 'voucher.column.targets' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.targets' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const { scope, targets } = row.original
        if (scope === Scope.AllTargets) {
          return (
            <p className='text-center font-medium text-muted-foreground'>{i18next.t('voucher.scope.allTargets')}</p>
          )
        }

        return (
          <div className='flex justify-center gap-2 mx-auto'>
            {targets.length > 0 ? (
              targets.map((target) => (
                <Link key={target.id} to={`/packages/${target.targetId}`}>
                  <Badge
                    variant='outline'
                    className={cn(
                      'text-xs rounded-sm w-16 border-dashed',
                      target.isActive
                        ? 'bg-primary/10 border-primary hover:bg-primary/20'
                        : 'bg-gray-100 border-gray-400 hover:bg-gray-200'
                    )}
                    title={target.targetName}
                  >
                    <p className={cn('truncate', target.isActive ? 'text-primary' : 'text-gray-400')}>
                      {target.targetName}
                    </p>
                  </Badge>
                </Link>
              ))
            ) : (
              <p className='text-center text-xs text-muted-foreground'>{i18next.t('voucher.column.none')}</p>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true
    },
    {
      id: 'usageLimitPerUser',
      accessorKey: 'usageLimitPerUser',
      meta: { label: 'voucher.column.usageLimitPerUser' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.usageLimitPerUser' className='mx-auto' />
      ),
      cell: ({ row }) => <p className='text-center'>{row.original.usageLimitPerUser}</p>,
      enableSorting: false,
      enableHiding: true
    },
    // {
    //   id: 'isStackable',
    //   accessorKey: 'isStackable',
    //   meta: { label: 'voucher.column.isStackable' },
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} label='voucher.column.isStackable' className='mx-auto' />
    //   ),
    //   cell: ({ row }) => (
    //     <div className='flex justify-center'>
    //       {row.original.isStackable ? (
    //         <CheckCheckIcon className='size-4 text-primary' />
    //       ) : (
    //         <XIcon className='size-4 text-muted-foreground' />
    //       )}
    //     </div>
    //   ),
    //   enableSorting: false,
    //   enableHiding: true
    // },
    {
      id: 'startsAt',
      accessorKey: 'startsAtUtc',
      meta: { label: 'voucher.column.startsAt', variant: 'date' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.startsAt' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-center whitespace-nowrap text-muted-foreground'>
          {formatDateTime(row.original.startsAtUtc, 'dateTimeShort')}
        </p>
      ),
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: 'endsAt',
      accessorKey: 'endsAtUtc',
      meta: { label: 'voucher.column.endsAt', variant: 'date' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.endsAt' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-center whitespace-nowrap text-muted-foreground'>
          {formatDateTime(row.original.endsAtUtc, 'dateTimeShort')}
        </p>
      ),
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: { label: 'voucher.column.createdOnUtc' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.column.createdOnUtc' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-center whitespace-nowrap text-muted-foreground'>
          {formatDateTime(row.original.createdOnUtc, 'dateTimeShort')}
        </p>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { code } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('common.ui.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('voucher.column.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code)
                    toast.success(i18next.t('voucher.toast.copySuccess'))
                  } catch {
                    toast.error(i18next.t('voucher.toast.copyFailed'))
                  }
                }}
              >
                <CopyIcon />
                {i18next.t('voucher.action.copyCode')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete({ voucherId: row.original.id, voucherCode: row.original.code })}
                disabled={isDeletingVoucher}
                className='focus:text-destructive'
              >
                <Trash2Icon className='focus:text-destructive' />
                {i18next.t('voucher.action.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    }
  ]
}
