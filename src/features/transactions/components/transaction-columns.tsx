import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { TransactionStatus, type Currency, type TransactionRow } from '@/features/transactions/types'
import { cn, formatCurrency } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import i18next from 'i18next'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MoreHorizontalIcon,
  RotateCcw,
  SearchIcon,
  Undo2,
  Wallet,
  XCircle,
  Zap
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'

export const getColumns = (): ColumnDef<TransactionRow>[] => {
  return [
    {
      id: 'description',
      accessorKey: 'description',
      meta: {
        label: 'transactions.column.description',
        placeholder: 'transactions.column.descriptionPlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='transactions.column.description' />,
      cell: ({ row }) => (
        <Link to={`/payments/checkout?transactionId=${row.original.transactionId}`}>
          <p className='max-w-75 truncate hover:underline'>{row.original.description || '—'}</p>
        </Link>
      ),
      enableSorting: false,
      enableColumnFilter: true,
      size: 200
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      meta: {
        label: 'transactions.column.amount'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='transactions.column.amount' />,
      cell: ({ row }) => (
        <p className='font-bold text-primary'>
          {formatCurrency(row.original.amount, row.original.currency as Currency)}
        </p>
      ),
      enableSorting: true,
      size: 100
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: {
        label: 'transactions.column.status',
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='transactions.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status

        const statusConfig = {
          [TransactionStatus.Pending]: {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200/50'
          },
          [TransactionStatus.Completed]: {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
          },
          [TransactionStatus.Failed]: {
            icon: AlertCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200/50'
          },
          [TransactionStatus.Canceled]: {
            icon: XCircle,
            className: 'bg-slate-100 text-slate-700 border-slate-200/50'
          },
          [TransactionStatus.Refunded]: {
            icon: RotateCcw,
            className: 'bg-blue-50 text-blue-700 border-blue-200/50'
          }
        }

        const config = statusConfig[status] || { icon: AlertCircle, className: 'bg-slate-50 text-slate-600' }
        const Icon = config.icon

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={cn('flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium', config.className)}
            >
              <Icon className='size-3.5' />
              {i18next.t(`transactions.status.${status.toLowerCase()}`)}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'type',
      accessorKey: 'type',
      meta: {
        label: 'transactions.column.type',
        variant: 'multiSelect'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='transactions.column.type' />,
      cell: ({ row }) => {
        const type = row.original.type
        const Icon = type === 'Refund' ? Undo2 : CreditCard

        return (
          <div className='flex items-center gap-2'>
            <Icon className='size-4 text-muted-foreground/80' />
            <span className='text-sm font-medium'>{i18next.t(`transactions.type.${type.toLowerCase()}`)}</span>
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'targetModel',
      accessorKey: 'targetModel',
      meta: {
        label: 'transactions.column.targetModel'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='transactions.column.targetModel' />,
      cell: ({ row }) => {
        const targetModel = row.original.targetModel
        const Icon = targetModel === 'Subscription' ? Zap : Calendar
        const targetKey = targetModel.charAt(0).toLowerCase() + targetModel.slice(1)

        return (
          <div className='flex items-center gap-2'>
            <Icon className='size-4 text-muted-foreground/80' />
            <span className='text-sm font-medium'>{i18next.t(`transactions.targetModel.${targetKey}`)}</span>
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'gatewayName',
      accessorKey: 'gatewayName',
      meta: {
        label: 'transactions.column.method'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='transactions.column.method' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Wallet className='size-4 text-muted-foreground/80' />
          <p className='text-sm'>{row.original.gatewayName || i18next.t('common.ui.emptyValue')}</p>
        </div>
      ),
      enableSorting: false,
      size: 100
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: { label: 'transactions.column.createdDate', variant: 'dateRange' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='transactions.column.createdDate' />,
      cell: ({ row }) => (
        <p className='text-muted-foreground'>
          {format(new Date(row.original.createdOnUtc), i18next.t('transactions.column.dateFormat'), {
            locale: i18next.language === 'vi' ? vi : enUS
          })}
        </p>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      size: 150
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { transactionId } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('common.ui.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('transactions.column.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(transactionId)
                    toast.success(i18next.t('transactions.column.copyId'), {
                      description: i18next.t('checkout.transactionLabel')
                    })
                  } catch {
                    toast.error(i18next.t('checkout.error.copyFailed'))
                  }
                }}
              >
                {i18next.t('transactions.column.copyId')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/payments/checkout?transactionId=${transactionId}`}>
                  {i18next.t('transactions.column.viewDetails')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 30
    }
  ]
}
