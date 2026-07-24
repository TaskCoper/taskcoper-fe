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
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { EyeIcon, ImageIcon, MoreHorizontalIcon } from 'lucide-react'
import type { Product } from '../types'
import { formatPrice, formatQuantity, parseNumber } from '../utils'

const MAX_PRICE_FILTER = 10_000_000

const renderNoData = (t: TenantT) => (
  <span className='text-muted-foreground/60 italic text-sm select-none'>{t('products.common.noData')}</span>
)

const renderText = (value: string | null, t: TenantT, className?: string) => {
  const text = value?.trim()
  if (!text) return renderNoData(t)

  return <p className={cn('truncate', className)}>{text}</p>
}

function isActiveStatus(status: string | null) {
  if (!status) return false
  const normalized = status.toLowerCase()
  return normalized.includes('bán') || normalized.includes('active') || normalized.includes('kinh doanh')
}

export const getProductColumns = ({
  t,
  onViewDetail
}: {
  t: TenantT
  onViewDetail: (product: Product) => void
}): ColumnDef<Product>[] => {
  return [
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
      id: 'image',
      header: () => <span className='sr-only'>{t('products.column.image')}</span>,
      cell: ({ row }) => {
        const { coverImage, productName } = row.original

        return (
          <button
            type='button'
            onClick={() => onViewDetail(row.original)}
            className='group relative block size-11 overflow-hidden rounded-lg border bg-muted transition-colors hover:border-primary'
            aria-label={t('products.action.viewDetails')}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={productName ?? ''}
                loading='lazy'
                className='size-full object-cover transition-transform group-hover:scale-105'
              />
            ) : (
              <span className='flex size-full items-center justify-center'>
                <ImageIcon className='size-5 text-muted-foreground/40' />
              </span>
            )}
          </button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 64
    },
    {
      id: 'product',
      accessorKey: 'productName',
      meta: { label: 'products.column.product' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='products.column.product' />,
      cell: ({ row }) => {
        const { productName, productCode } = row.original

        return (
          <button
            type='button'
            onClick={() => onViewDetail(row.original)}
            className='flex max-w-72 flex-col items-start text-left'
          >
            <span className='truncate font-medium hover:underline'>
              {productName?.trim() || t('products.common.unnamed')}
            </span>
            {productCode?.trim() && (
              <span className='truncate font-mono text-xs text-muted-foreground'>{productCode}</span>
            )}
          </button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 260
    },
    {
      id: 'category',
      accessorFn: (row) => row.categoryName,
      meta: { label: 'products.column.category' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='products.column.category' />,
      cell: ({ row }) => {
        const value = row.original.categoryName?.trim()
        if (!value) return renderNoData(t)

        return (
          <Badge variant='secondary' className='font-normal'>
            {value}
          </Badge>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 160
    },
    {
      id: 'brand',
      accessorFn: (row) => row.brand,
      meta: { label: 'products.column.brand' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='products.column.brand' />,
      cell: ({ row }) => renderText(row.original.brand, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'supplier',
      accessorFn: (row) => row.supplier,
      meta: { label: 'products.column.supplier' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='products.column.supplier' />,
      cell: ({ row }) => renderText(row.original.supplier, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 160
    },
    {
      id: 'productType',
      accessorFn: (row) => row.productType,
      meta: { label: 'products.column.productType' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='products.column.productType' />,
      cell: ({ row }) => renderText(row.original.productType, t),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'unit',
      accessorFn: (row) => row.unit,
      meta: { label: 'products.column.unit' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.unit' className='mx-auto' />
      ),
      cell: ({ row }) => <div className='text-center'>{renderText(row.original.unit, t, 'mx-auto inline-block')}</div>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 90
    },
    {
      id: 'barcode',
      accessorFn: (row) => row.barcode,
      meta: { label: 'products.column.barcode' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='products.column.barcode' />,
      cell: ({ row }) => {
        const value = row.original.barcode?.trim()
        if (!value) return renderNoData(t)

        return <p className='truncate font-mono text-xs'>{value}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'price',
      accessorFn: (row) => parseNumber(row.priceWithVatRaw ?? row.priceRaw),
      meta: {
        label: 'products.column.price',
        variant: 'range',
        unit: '₫',
        range: [0, MAX_PRICE_FILTER]
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.price' className='ml-auto' />
      ),
      cell: ({ row }) => {
        const value = formatPrice(row.original.priceWithVatRaw ?? row.original.priceRaw)
        if (!value) return <div className='text-right'>{renderNoData(t)}</div>

        return <p className='text-right font-semibold text-emerald-600 dark:text-emerald-400'>{value}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 140
    },
    {
      id: 'importPrice',
      accessorFn: (row) => parseNumber(row.importPriceRaw),
      meta: { label: 'products.column.importPrice' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.importPrice' className='ml-auto' />
      ),
      cell: ({ row }) => {
        const value = formatPrice(row.original.importPriceRaw)
        return (
          <div className='text-right'>{value ? <span className='font-medium'>{value}</span> : renderNoData(t)}</div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'costPrice',
      accessorFn: (row) => parseNumber(row.costPriceRaw),
      meta: { label: 'products.column.costPrice' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.costPrice' className='ml-auto' />
      ),
      cell: ({ row }) => {
        const value = formatPrice(row.original.costPriceRaw)
        return (
          <div className='text-right'>{value ? <span className='font-medium'>{value}</span> : renderNoData(t)}</div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'wholesalePrice',
      accessorFn: (row) => parseNumber(row.wholesalePriceRaw),
      meta: { label: 'products.column.wholesalePrice' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.wholesalePrice' className='ml-auto' />
      ),
      cell: ({ row }) => {
        const value = formatPrice(row.original.wholesalePriceRaw)
        return (
          <div className='text-right'>{value ? <span className='font-medium'>{value}</span> : renderNoData(t)}</div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'availableForSale',
      accessorFn: (row) => parseNumber(row.availableForSaleRaw),
      meta: { label: 'products.column.availableForSale' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.availableForSale' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = parseNumber(row.original.availableForSaleRaw)
        if (value === null) return <div className='text-center'>{renderNoData(t)}</div>

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={cn(
                'font-semibold tabular-nums',
                value > 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400'
              )}
            >
              {formatQuantity(row.original.availableForSaleRaw)}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'totalStock',
      accessorFn: (row) => parseNumber(row.totalStockRaw),
      meta: { label: 'products.column.totalStock' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.totalStock' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = formatQuantity(row.original.totalStockRaw)
        return <div className='text-center tabular-nums'>{value ? <span>{value}</span> : renderNoData(t)}</div>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 100
    },
    {
      id: 'size',
      accessorFn: (row) => row.size,
      meta: { label: 'products.column.size' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.size' className='mx-auto' />
      ),
      cell: ({ row }) => <div className='text-center'>{renderText(row.original.size, t, 'mx-auto inline-block')}</div>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 100
    },
    {
      id: 'color',
      accessorFn: (row) => row.color,
      meta: { label: 'products.column.color' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.color' className='mx-auto' />
      ),
      cell: ({ row }) => <div className='text-center'>{renderText(row.original.color, t, 'mx-auto inline-block')}</div>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 110
    },
    {
      id: 'origin',
      accessorFn: (row) => row.origin,
      meta: { label: 'products.column.origin' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.origin' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='text-center'>{renderText(row.original.origin, t, 'mx-auto inline-block')}</div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 120
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      meta: { label: 'products.column.status' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const value = row.original.status?.trim()
        if (!value) return <div className='text-center'>{renderNoData(t)}</div>

        const active = isActiveStatus(value)
        return (
          <div className='flex justify-center'>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                active
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'border-muted-foreground/20 bg-muted text-muted-foreground'
              )}
            >
              <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
              {value}
            </span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'createdAt',
      accessorFn: (row) => row.nhanhCreatedAtRaw,
      meta: { label: 'products.column.createdAt' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='products.column.createdAt' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='text-center whitespace-nowrap'>
          {renderText(row.original.nhanhCreatedAtRaw, t, 'mx-auto inline-block')}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 130
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{t('products.action.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('products.action.actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetail(row.original)}>
              <EyeIcon className='size-4' />
              {t('products.action.viewDetails')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 40
    }
  ]
}
