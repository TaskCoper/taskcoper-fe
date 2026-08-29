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
import { EyeIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import type { CardTemplateListItem } from '../types'
import CardTemplateDescription from './card-template-description'
import CardTemplatePreview from './card-template-preview'

export const getCardTemplateColumns = ({
  t,
  onPreview
}: {
  t: TenantT
  onPreview: (template: CardTemplateListItem) => void
}): ColumnDef<CardTemplateListItem>[] => [
  {
    id: 'search',
    accessorKey: 'name',
    meta: {
      label: 'cardTemplates.column.name',
      placeholder: 'cardTemplates.searchPlaceholder',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='cardTemplates.column.name' />,
    cell: ({ row }) => <span className='min-w-48 text-sm font-medium'>{row.original.name}</span>,
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 220
  },
  {
    id: 'preview',
    meta: { label: 'cardTemplates.column.preview' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='cardTemplates.column.preview' />,
    cell: ({ row }) => (
      <CardTemplatePreview
        src={row.original.previewImageUrl}
        alt={t('cardTemplates.previewAlt', { name: row.original.name })}
        openLabel={t('cardTemplates.openPreview', { name: row.original.name })}
        onOpen={() => onPreview(row.original)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 145
  },
  {
    id: 'description',
    accessorKey: 'description',
    meta: { label: 'cardTemplates.column.description' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='cardTemplates.column.description' />,
    cell: ({ row }) => (
      <CardTemplateDescription
        description={row.original.description}
        emptyLabel={t('cardTemplates.noDescription')}
        label={t('cardTemplates.column.description')}
      />
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 320
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    meta: {
      label: 'cardTemplates.column.status',
      variant: 'radio',
      options: [
        { label: t('cardTemplates.status.active'), value: 'true' },
        { label: t('cardTemplates.status.inactive'), value: 'false' }
      ]
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='cardTemplates.column.status' />,
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
        {t(`cardTemplates.status.${row.original.isActive ? 'active' : 'inactive'}`)}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 140
  },
  {
    id: 'actions',
    meta: { label: 'cardTemplates.column.actions' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label='cardTemplates.column.actions' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{t('cardTemplates.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('cardTemplates.column.actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onPreview(row.original)}>
              <EyeIcon />
              {t('cardTemplates.viewPreview')}
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
