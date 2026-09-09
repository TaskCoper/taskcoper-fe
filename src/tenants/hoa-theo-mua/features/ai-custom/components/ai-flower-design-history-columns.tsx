import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { GeneratedFlowerHistoryItem } from '../types'
import AiCardPreview from './ai-card-preview'
import AiFlowerComboFilter from './ai-flower-combo-filter'

export const getAiFlowerDesignHistoryColumns = ({
  t,
  onPreview
}: {
  t: TenantT
  onPreview: (design: GeneratedFlowerHistoryItem) => void
}): ColumnDef<GeneratedFlowerHistoryItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label={t('products.column.selectAll')}
        className='translate-y-0.5'
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={t('products.column.selectRow')}
        className='translate-y-0.5'
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
    id: 'preview',
    meta: { label: 'aiCustom.flowerHistory.column.preview' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.flowerHistory.column.preview' />,
    cell: ({ row }) => (
      <AiCardPreview
        src={row.original.imageUrl}
        alt={t('aiCustom.flowerHistory.previewAlt', { code: row.original.generatedFlowerId })}
        openLabel={t('aiCustom.flowerHistory.openPreview', { code: row.original.generatedFlowerId })}
        onOpen={() => onPreview(row.original)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 120
  },
  {
    id: 'search',
    accessorFn: (row) => row.nameCustomer,
    meta: {
      label: 'aiCustom.flowerHistory.column.customer',
      placeholder: 'aiCustom.flowerHistory.searchPlaceholder',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.flowerHistory.column.customer' />,
    cell: ({ row }) => (
      <div className='min-w-40'>
        <p className='truncate text-sm font-medium'>
          {row.original.nameCustomer?.trim() || t('aiCustom.history.walkInCustomer')}
        </p>
        <p className='mt-0.5 truncate text-xs text-muted-foreground'>{row.original.phoneCustomer?.trim() || '-'}</p>
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 190
  },
  {
    id: 'comboIds',
    accessorKey: 'comboId',
    meta: {
      label: 'aiCustom.flowerHistory.column.sourceCombo',
      variant: 'multiSelect',
      renderFilter: ({ column, label }) => <AiFlowerComboFilter column={column} label={label} />
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.flowerHistory.column.sourceCombo' />,
    cell: ({ row }) => (
      <div className='min-w-52 max-w-72'>
        <p className='truncate text-sm font-medium'>{row.original.comboName?.trim() || '-'}</p>
        <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground'>
          {row.original.productCode?.trim() || '-'}
        </p>
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 240
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    meta: { label: 'aiCustom.flowerHistory.column.createdAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.flowerHistory.column.createdAt' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm tabular-nums'>
        {formatDateTime(row.original.createdAt, 'dateTimeShort')}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 160
  },
  {
    id: 'actions',
    meta: { label: 'aiCustom.flowerHistory.column.actions' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label='aiCustom.flowerHistory.column.actions' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{t('products.action.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('products.action.actions')}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={row.original.generatedFlowerId}>
                <EyeIcon />
                {t('aiCustom.flowerHistory.viewDetail')}
              </Link>
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
