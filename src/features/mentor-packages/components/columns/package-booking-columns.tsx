import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PackageBookingStatus, PackageBookingStatusLabel } from '@/features/package-bookings/types'
import { formatCurrency, formatDate, getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { CheckCircle2Icon, Clock3Icon, MoreHorizontalIcon, XCircleIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { MentorPackageBooking } from '../../types'

const statusConfig: Record<PackageBookingStatus, { icon: typeof Clock3Icon; className: string }> = {
  [PackageBookingStatus.Pending]: {
    icon: Clock3Icon,
    className: 'bg-amber-50 text-amber-700 border-amber-200/50'
  },
  [PackageBookingStatus.Active]: {
    icon: Clock3Icon,
    className: 'bg-sky-50 text-sky-700 border-sky-200/50'
  },
  [PackageBookingStatus.Completed]: {
    icon: CheckCircle2Icon,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
  },
  [PackageBookingStatus.Cancelled]: {
    icon: XCircleIcon,
    className: 'bg-rose-50 text-rose-700 border-rose-200/50'
  },
  [PackageBookingStatus.ExpiredUnused]: {
    icon: XCircleIcon,
    className: 'bg-slate-100 text-slate-700 border-slate-200/50'
  },
  [PackageBookingStatus.ExpiredUnfinished]: {
    icon: XCircleIcon,
    className: 'bg-slate-100 text-slate-700 border-slate-200/50'
  }
}

export const getColumns = (
  onViewDetails?: (booking: MentorPackageBooking) => void
): ColumnDef<MentorPackageBooking>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='systemUsers.column.selectAll'
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label='systemUsers.column.selectRow'
          className='translate-y-0.5'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30
    },
    {
      id: 'bookedByUser',
      accessorFn: (row) => `${row.bookedByUser.firstName} ${row.bookedByUser.lastName}`,
      meta: {
        label: 'common.field.name'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='common.field.name' />,
      cell: ({ row }) => {
        const { avatarUrl, firstName, lastName, email, slug } = row.original.bookedByUser
        const fullName = `${firstName} ${lastName}`

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-7 ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className='text-xs'>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>

            <div className='flex flex-col'>
              <Link to={`/users/${slug}`} className='font-medium hover:underline hover:text-primary'>
                {fullName}
              </Link>
              <p className='text-xs text-muted-foreground'>{email}</p>
            </div>
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      size: 220
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: {
        label: 'transactions.column.status',
        variant: 'radio',
        options: Object.values(PackageBookingStatus).map((status) => ({
          value: status,
          label: i18next.t(PackageBookingStatusLabel[status])
        }))
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='transactions.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const config = statusConfig[status]
        const Icon = config.icon

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={`flex items-center gap-1.5 px-2 py-0.5 font-medium rounded-md ${config.className}`}
            >
              <Icon className='size-3.5' />
              {i18next.t(PackageBookingStatusLabel[status])}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 140
    },
    {
      id: 'priceAtBooking',
      accessorKey: 'priceAtBooking',
      meta: {
        label: 'mentorPackage.form.price'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.price' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='font-medium text-primary text-center'>
          {formatCurrency(row.original.priceAtBooking, row.original.currencyAtBooking)}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 120
    },
    {
      id: 'progress',
      accessorFn: (row) => row.completedSessions,
      meta: {
        label: 'purchaseHistory.detail.progress'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='purchaseHistory.detail.progress' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-sm text-muted-foreground text-center'>
          {i18next.t('purchaseHistory.meetingsCount', {
            booked: row.original.completedSessions,
            total: row.original.totalSessions
          })}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 140
    },
    {
      id: 'activationDeadlineUtc',
      accessorKey: 'activationDeadlineUtc',
      meta: {
        label: 'mentorPackage.form.activationDeadlineDays'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.activationDeadlineDays' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground text-center text-sm'>
          {row.original.activationDeadlineUtc
            ? formatDate(row.original.activationDeadlineUtc, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
            : i18next.t('common.ui.emptyValue')}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 160
    },
    {
      id: 'usageDeadlineUtc',
      accessorKey: 'usageDeadlineUtc',
      meta: {
        label: 'mentorPackage.form.usageDeadlineDays'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='mentorPackage.form.usageDeadlineDays' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground text-center text-sm'>
          {row.original.usageDeadlineUtc
            ? formatDate(row.original.usageDeadlineUtc, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
            : i18next.t('common.ui.emptyValue')}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 160
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'common.field.createdOnUtc'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='common.field.createdOnUtc' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <p className='text-muted-foreground text-center text-sm'>
          {formatDate(row.original.createdOnUtc, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </p>
      ),
      enableSorting: true,
      enableHiding: true,
      size: 120
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('common.ui.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('common.ui.action')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
                {i18next.t('transactions.column.viewDetails')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 50
    }
  ]
}
