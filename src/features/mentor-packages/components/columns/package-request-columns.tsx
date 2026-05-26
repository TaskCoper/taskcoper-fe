import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { PACKAGE_REQUEST_STATUS_BADGE_THEME } from '@/features/package-bookings/constants'
import {
  PackageRequestStatus,
  PackageRequestStatusLabel,
  type PackageIncomingRequest
} from '@/features/package-bookings/types'
import { formatDateTime } from '@/lib/date'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { MoreHorizontalIcon } from 'lucide-react'

export const getColumns = (
  onViewDetails?: (request: PackageIncomingRequest) => void
): ColumnDef<PackageIncomingRequest>[] => {
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
      id: 'requestedByUser',
      accessorFn: (row) => `${row.requestedByFirstName} ${row.requestedByLastName}`,
      meta: {
        label: 'common.field.name'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='common.field.name' />,
      cell: ({ row }) => {
        const fullName = `${row.original.requestedByFirstName} ${row.original.requestedByLastName}`

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-7 ring-2 ring-primary ring-offset-2'>
              <AvatarFallback className='text-xs'>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>

            <div className='flex flex-col'>
              <p className='font-medium'>{fullName}</p>
              <p className='text-xs text-muted-foreground'>{row.original.requestedByEmail}</p>
            </div>
          </div>
        )
      },
      enableSorting: false,
      size: 220
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: {
        label: 'transactions.column.status',
        variant: 'radio',
        options: Object.values(PackageRequestStatus).map((status) => ({
          value: status,
          label: i18next.t(PackageRequestStatusLabel[status])
        }))
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='transactions.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const config = PACKAGE_REQUEST_STATUS_BADGE_THEME[status]
        const Icon = config.icon

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={`flex items-center gap-1.5 px-2 py-0.5 font-medium rounded-md ${config.className}`}
            >
              <Icon className='size-3.5' />
              {i18next.t(PackageRequestStatusLabel[status])}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      size: 140
    },
    // {
    //   id: 'problemStatement',
    //   accessorFn: (row) => getPlainTextFromHtml(row.problemStatement),
    //   meta: {
    //     label: 'packageBooking.requestPackage.problemStatement'
    //   },
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} label='packageBooking.requestPackage.problemStatement' />
    //   ),
    //   cell: ({ row }) => {
    //     const problemStatement = getPlainTextFromHtml(row.original.problemStatement).trim()

    //     return (
    //       <p className='line-clamp-2 text-sm text-muted-foreground max-w-110'>
    //         {problemStatement || i18next.t('common.ui.emptyValue')}
    //       </p>
    //     )
    //   },
    //   enableSorting: false,
    //   size: 440
    // },
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
          {formatDateTime(row.original.createdOnUtc, 'dateTimeMedium')}
        </p>
      ),
      enableSorting: false,
      size: 150
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex justify-center'>
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
        </div>
      ),
      size: 50
    }
  ]
}
