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
import { formatDate } from '@/shared/utils'
import { Checkbox } from '@radix-ui/react-checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { formatCurrency } from '../../utils'
import type { RevenueItem } from '../project-revenue-table'

export const getColumns = ({
  onDeleteRevenue
}: {
  onDeleteRevenue: (id: string) => void
}): ColumnDef<RevenueItem>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='projectRevenue.column.selectAll'
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label='projectRevenue.column.selectRow'
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
      id: 'name',
      accessorKey: 'name',
      meta: {
        label: 'project.projectRevenue.table.name',
        placeholder: 'project.projectRevenue.table.namePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='project.projectRevenue.table.name' />,
      cell: ({ row }) => <p className='font-medium'>{row.original.name}</p>,
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true
    },
    {
      id: 'type',
      accessorKey: 'type',
      meta: {
        label: 'project.projectRevenue.table.type',
        variant: 'multiSelect'
      },
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 0
    },
    {
      id: 'typeDisplay',
      accessorKey: 'type',
      meta: {
        label: 'project.projectRevenue.table.type'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='project.projectRevenue.table.type' />,
      cell: ({ row }) =>
        row.original.type === 'income' ? (
          <Badge className='gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200'>
            <ArrowUpCircleIcon className='size-3' />
            {i18next.t('project.projectRevenue.type.income')}
          </Badge>
        ) : (
          <Badge className='gap-1 text-rose-600 bg-rose-50 border border-rose-200'>
            <ArrowDownCircleIcon className='size-3' />
            {i18next.t('project.projectRevenue.type.expense')}
          </Badge>
        ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      meta: {
        label: 'project.projectRevenue.table.amount'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='project.projectRevenue.table.amount' />,
      cell: ({ row }) => (
        <span className={row.original.type === 'income' ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>
          {row.original.type === 'income' ? '+' : '-'}
          {formatCurrency(row.original.amount)}
        </span>
      ),
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false
    },
    {
      id: 'balanceAfter',
      accessorKey: 'balanceAfter',
      meta: {
        label: 'project.projectRevenue.table.balanceAfter'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='project.projectRevenue.table.balanceAfter' />
      ),
      cell: ({ row }) => <span className='font-medium'>{formatCurrency(row.original.balanceAfter)}</span>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false
    },
    {
      id: 'note',
      accessorKey: 'note',
      meta: {
        label: 'project.projectRevenue.table.note'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='project.projectRevenue.table.note' />,
      cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.note || '—'}</span>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'project.projectRevenue.table.createdAt',
        variant: 'dateRange'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='project.projectRevenue.table.createdAt' />,
      cell: ({ row }) => {
        const value = row.getValue('createdOnUtc')
        if (!value) return <p className='text-muted-foreground'>-</p>
        return <p className='text-sm'>{formatDate(value as string)}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('project.projectRevenue.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('project.projectRevenue.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='focus:text-destructive' onClick={() => onDeleteRevenue(id)}>
                {i18next.t('project.projectRevenue.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    }
  ]
}
