import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { DownloadIcon, EyeIcon, LoaderCircleIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { CardSize } from '../../configs/card-config-palette'
import { AiCardWritingMode, type GeneratedCardHistoryItem } from '../types'
import AiCardPreview from './ai-card-preview'

export const getAiCardHistoryColumns = ({
  t,
  onPreview,
  onDownload,
  downloadingCardId,
  sizeOptions
}: {
  t: TenantT
  onPreview: (card: GeneratedCardHistoryItem) => void
  onDownload: (card: GeneratedCardHistoryItem) => void
  downloadingCardId?: string
  sizeOptions: CardSize[]
}): ColumnDef<GeneratedCardHistoryItem>[] => [
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
    meta: { label: 'aiCustom.history.column.preview' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.history.column.preview' />,
    cell: ({ row }) => (
      <AiCardPreview
        src={row.original.imageUrl}
        alt={t('aiCustom.history.previewAlt', { code: row.original.generatedCardId })}
        openLabel={t('aiCustom.history.openPreview', { code: row.original.generatedCardId })}
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
      label: 'aiCustom.history.column.customer',
      placeholder: 'aiCustom.history.searchPlaceholder',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.history.column.customer' />,
    cell: ({ row }) => {
      const { nameCustomer, phoneCustomer } = row.original

      return (
        <div className='min-w-0 max-w-48'>
          <p className='truncate font-medium' title={nameCustomer ?? undefined}>
            {nameCustomer?.trim() || t('aiCustom.history.walkInCustomer')}
          </p>
          {phoneCustomer?.trim() && (
            <p className='mt-0.5 truncate text-xs text-muted-foreground' title={phoneCustomer}>
              {phoneCustomer}
            </p>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 190
  },
  {
    id: 'template',
    accessorFn: (row) => row.templateName,
    meta: { label: 'aiCustom.history.column.template' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.history.column.template' />,
    cell: ({ row }) => <p className='min-w-36 truncate'>{row.original.templateName?.trim() || '-'}</p>,
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 180
  },
  {
    id: 'sizeName',
    accessorKey: 'sizeName',
    meta: {
      label: 'aiCustom.history.column.size',
      variant: 'radio',
      options: sizeOptions.map((size) => ({
        label: `${size.width} x ${size.height} cm · ${size.name}`,
        value: size.name
      }))
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.history.column.size' />,
    cell: ({ row }) => {
      const { sizeWidth, sizeHeight, sizeName } = row.original
      const dimensions = sizeWidth != null && sizeHeight != null ? `${sizeWidth} x ${sizeHeight} cm` : null
      const displaySize = [dimensions, sizeName?.trim()].filter(Boolean).join(' · ')

      return (
        <Badge variant='secondary' className='whitespace-nowrap font-normal'>
          {displaySize || '-'}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 130
  },
  {
    id: 'formType',
    accessorKey: 'formType',
    meta: {
      label: 'aiCustom.history.column.writingMode',
      variant: 'radio',
      options: [
        { label: t('aiCustom.history.writingMode.calligraphy'), value: AiCardWritingMode.Calligraphy },
        { label: t('aiCustom.history.writingMode.typed'), value: AiCardWritingMode.GoMay }
      ]
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.history.column.writingMode' />,
    cell: ({ row }) => {
      const isCalligraphy = row.original.formType === AiCardWritingMode.Calligraphy

      return (
        <Badge
          variant='outline'
          className={cn(
            'whitespace-nowrap font-normal',
            isCalligraphy
              ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300'
              : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300'
          )}
        >
          {t(isCalligraphy ? 'aiCustom.history.writingMode.calligraphy' : 'aiCustom.history.writingMode.typed')}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 130
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    meta: { label: 'aiCustom.history.column.createdAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='aiCustom.history.column.createdAt' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm tabular-nums'>
        {formatDateTime(row.original.createdAt, 'dateTimeShort')}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'actions',
    meta: { label: 'aiCustom.history.column.actions' },
    header: () => null,
    cell: ({ row }) => {
      const isDownloading = downloadingCardId === row.original.generatedCardId

      return (
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
                <Link to={row.original.generatedCardId}>
                  <EyeIcon />
                  {t('aiCustom.history.viewDetail')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isDownloading} onSelect={() => onDownload(row.original)}>
                {isDownloading ? <LoaderCircleIcon className='animate-spin' /> : <DownloadIcon />}
                {t('aiCustom.download.action')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 88
  }
]
