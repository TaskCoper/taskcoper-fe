import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, MoreHorizontalIcon, PowerIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import type { FloralMockupListItem } from '../types'
import FloralMockupDescription from './floral-mockup-description'
import FloralMockupPreview from './floral-mockup-preview'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDateTime } from '@/lib/date'

export const getFloralMockupColumns = ({
  t,
  onPreview,
  onViewDetail,
  onToggleStatus,
  onDelete
}: {
  t: TenantT
  onPreview: (mockup: FloralMockupListItem) => void
  onViewDetail: (mockup: FloralMockupListItem) => void
  onToggleStatus: (mockup: FloralMockupListItem) => void
  onDelete: (mockup: FloralMockupListItem) => void
}): ColumnDef<FloralMockupListItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label={t('floralMockups.column.selectAll')}
        className='translate-y-0.5'
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={t('floralMockups.column.selectRow')}
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
    meta: { label: 'floralMockups.column.preview' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='floralMockups.column.preview' />,
    cell: ({ row }) => (
      <FloralMockupPreview
        src={row.original.imageUrl}
        alt={t('floralMockups.previewAlt', { name: row.original.name })}
        openLabel={t('floralMockups.openPreview', { name: row.original.name })}
        onOpen={() => onPreview(row.original)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 120
  },
  {
    id: 'name',
    accessorKey: 'name',
    meta: {
      label: 'floralMockups.column.name',
      placeholder: 'floralMockups.searchPlaceholder',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='floralMockups.column.name' />,
    cell: ({ row }) => <span className='min-w-48 text-sm font-medium'>{row.original.name}</span>,
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 230
  },
  {
    id: 'description',
    accessorKey: 'description',
    meta: { label: 'floralMockups.column.description' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='floralMockups.column.description' />,
    cell: ({ row }) => (
      <FloralMockupDescription description={row.original.description} emptyLabel={t('floralMockups.noDescription')} />
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 400
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    meta: {
      label: 'floralMockups.column.status',
      variant: 'radio',
      options: [
        { label: t('floralMockups.status.active'), value: 'true' },
        { label: t('floralMockups.status.inactive'), value: 'false' }
      ]
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='floralMockups.column.status' />,
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
          row.original.isActive
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
            : 'border-muted-foreground/20 bg-muted text-muted-foreground'
        )}
      >
        <span
          className={cn('size-1.5 rounded-full', row.original.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50')}
        />
        {t(`floralMockups.status.${row.original.isActive ? 'active' : 'inactive'}`)}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 130
  },
  {
    id: 'createdAt',
    accessorFn: (row) => row.createAt,
    meta: { label: 'floralMockups.column.createdAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='floralMockups.column.createdAt' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm tabular-nums'>
        {formatDateTime(row.original.createAt, 'dateTimeShort')}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'actions',
    meta: { label: 'floralMockups.column.actions' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label='floralMockups.column.actions' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{t('floralMockups.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('floralMockups.column.actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetail(row.original)}>
              <EyeIcon />
              {t('floralMockups.viewDetail')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(row.original)}>
              <PowerIcon />
              {t(`floralMockups.statusAction.${row.original.isActive ? 'deactivate' : 'activate'}`)}
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => onDelete(row.original)}>
              <Trash2Icon />
              {t('floralMockups.deleteAction.delete')}
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
