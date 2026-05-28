import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { type Currency } from '@/features/transactions/types'
import { formatDateTime } from '@/lib/date'
import { formatCurrency, getAvatarFallback } from '@/shared/utils'
import { type ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import {
  TargetTypeLabel,
  VoucherRedemptionStatus,
  VoucherRedemptionStatusLabel,
  type VoucherRedemptionRow
} from '../../types'

export const getColumns = (): ColumnDef<VoucherRedemptionRow>[] => {
  return [
    {
      id: 'user',
      meta: { label: 'voucher.redemption.column.user' },
      accessorFn: (row) => `${row.redeemedUserFirstName} ${row.redeemedUserLastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} label='voucher.redemption.column.user' />,
      cell: ({ row }) => {
        const {
          redeemedByUserId,
          redeemedUserFirstName,
          redeemedUserLastName,
          redeemedUserEmail,
          redeemedUserImageUrl
        } = row.original
        const fullName = `${redeemedUserFirstName} ${redeemedUserLastName}`

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={redeemedUserImageUrl ?? undefined} />
              <AvatarFallback>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>

            <div>
              <Link to={`/users/${redeemedByUserId}`} className='font-medium hover:underline'>
                {fullName}
              </Link>
              <p className='text-xs text-muted-foreground'>{redeemedUserEmail}</p>
            </div>
          </div>
        )
      },
      size: 200,
      enableSorting: false
    },
    {
      id: 'appliedTo',
      accessorKey: 'appliedToName',
      meta: { label: 'voucher.redemption.column.appliedTo', variant: 'text', icon: SearchIcon },
      header: ({ column }) => <DataTableColumnHeader column={column} label='voucher.redemption.column.appliedTo' />,
      cell: ({ row }) => {
        const { appliedToId, appliedToName } = row.original

        return (
          <div className='flex flex-col'>
            <Link to={`/packages/${appliedToId}`} className='font-medium hover:underline line-clamp-1'>
              {appliedToName}
            </Link>
          </div>
        )
      },
      size: 200,
      enableColumnFilter: true,
      enableSorting: false
    },
    {
      id: 'appliedToType',
      accessorKey: 'appliedToType',
      meta: { label: 'voucher.redemption.column.appliedToType' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.redemption.column.appliedToType' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const type = row.original.appliedToType
        const label = i18next.t(TargetTypeLabel[type])
        return (
          <div className='flex justify-center'>
            <Badge variant='outline' className='font-normal text-muted-foreground bg-muted/30 rounded-md'>
              {label}
            </Badge>
          </div>
        )
      },
      size: 150,
      enableSorting: false
    },
    {
      id: 'amountBeforeDiscount',
      accessorKey: 'amountBeforeDiscount',
      meta: { label: 'voucher.redemption.column.amountBeforeDiscount' },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label='voucher.redemption.column.amountBeforeDiscount'
          className='justify-end text-right'
        />
      ),
      cell: ({ row }) => (
        <div className='text-left font-medium'>
          {formatCurrency(row.original.amountBeforeDiscount, row.original.currency as Currency)}
        </div>
      ),
      size: 120
    },
    {
      id: 'discountAmount',
      accessorKey: 'discountAmount',
      meta: { label: 'voucher.redemption.column.discountAmount' },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label='voucher.redemption.column.discountAmount'
          className='justify-end text-right'
        />
      ),
      cell: ({ row }) => (
        <div className='text-left text-green-600 dark:text-green-400 font-medium'>
          -{formatCurrency(row.original.discountAmount, row.original.currency)}
        </div>
      ),
      size: 120
    },
    {
      id: 'amountAfterDiscount',
      accessorKey: 'amountAfterDiscount',
      meta: { label: 'voucher.redemption.column.amountAfterDiscount' },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label='voucher.redemption.column.amountAfterDiscount'
          className='justify-end text-right'
        />
      ),
      cell: ({ row }) => (
        <div className='text-left font-semibold'>
          {formatCurrency(row.original.amountAfterDiscount, row.original.currency as Currency)}
        </div>
      ),
      size: 120
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: { label: 'voucher.redemption.column.status' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='voucher.redemption.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const label = i18next.t(VoucherRedemptionStatusLabel[status])

        const getStatusBadge = () => {
          switch (status) {
            case VoucherRedemptionStatus.Applied:
              return (
                <Badge className='bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm px-2 py-0.5 text-xs font-medium rounded-sm'>
                  {label}
                </Badge>
              )
            case VoucherRedemptionStatus.Reserved:
              return (
                <Badge
                  variant='outline'
                  className='bg-amber-50 text-amber-700 border-amber-200 shadow-none px-2 py-0.5 text-xs font-medium rounded-sm'
                >
                  {label}
                </Badge>
              )
            case VoucherRedemptionStatus.Released:
              return (
                <Badge
                  variant='secondary'
                  className='bg-slate-100 text-slate-600 border-none px-2 py-0.5 text-xs font-medium rounded-sm'
                >
                  {label}
                </Badge>
              )
            case VoucherRedemptionStatus.Canceled:
              return (
                <Badge
                  variant='destructive'
                  className='px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold'
                >
                  {label}
                </Badge>
              )
            default:
              return (
                <Badge variant='secondary' className='rounded-full text-[10px] uppercase tracking-wider font-bold'>
                  {label}
                </Badge>
              )
          }
        }

        return <div className='flex justify-center'>{getStatusBadge()}</div>
      },
      size: 100,
      enableSorting: false
    },
    {
      id: 'redeemedAt',
      accessorKey: 'createdOnUtc',
      meta: { label: 'voucher.redemption.column.redeemedAt' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='voucher.redemption.column.redeemedAt' />,
      cell: ({ row }) => <div>{formatDateTime(row.original.createdOnUtc, 'dateTimeShort')}</div>,
      size: 150
    }
  ]
}
