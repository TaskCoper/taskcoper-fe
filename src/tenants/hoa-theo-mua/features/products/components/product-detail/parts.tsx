import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { PackageIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import type { Product } from '../../types'
import { formatPrice, formatQuantity, parseNumber } from '../../utils'
import { isActiveStatus, type SpecRow } from './fields'

export function DetailSection({
  title,
  description,
  action,
  children
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className='space-y-3'>
      <div className='flex items-start justify-between gap-4'>
        <div className='-space-y-1'>
          <h2 className='text-lg font-bold'>{title}</h2>
          {description && <p className='text-sm text-muted-foreground'>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Simple zebra-striped key/value rows inside a bordered container. */
export function DetailRows({ rows, t }: { rows: SpecRow[]; t: TenantT }) {
  if (rows.length === 0) {
    return (
      <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
        {t('products.common.noData')}
      </div>
    )
  }

  return (
    <div className='divide-y overflow-hidden rounded-lg border'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='grid grid-cols-1 gap-0.5 px-3 py-2 text-sm sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-baseline sm:gap-4'
        >
          <span className='text-muted-foreground'>{t(row.label)}</span>
          <span className='break-words font-medium'>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function VariantRow({ variant, t }: { variant: Product; t: TenantT }) {
  const name = variant.productName?.trim() || t('products.common.unnamed')
  const price = formatPrice(variant.priceWithVatRaw ?? variant.priceRaw)
  const stock = formatQuantity(variant.availableForSaleRaw)
  const available = parseNumber(variant.availableForSaleRaw)
  const outOfStock = available !== null && available <= 0
  const active = isActiveStatus(variant.status) && !outOfStock
  const statusText = outOfStock
    ? t('products.detail.outOfStock')
    : variant.status?.trim() || t('products.detail.inStock')

  return (
    <TableRow>
      <TableCell className='w-14'>
        <span className='flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
          {variant.coverImage ? (
            <img src={variant.coverImage} alt={name} className='size-full object-cover' />
          ) : (
            <PackageIcon className='size-5 text-muted-foreground/50' />
          )}
        </span>
      </TableCell>
      <TableCell className='max-w-56'>
        <Link
          to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${variant.id}`}
          className='block truncate font-medium hover:underline'
        >
          {name}
        </Link>
        {variant.productCode?.trim() && (
          <p className='truncate font-mono text-xs text-muted-foreground'>{variant.productCode}</p>
        )}
      </TableCell>
      <TableCell>
        <div className='flex flex-wrap gap-1.5'>
          {variant.color?.trim() && (
            <Badge variant='secondary' className='font-normal'>
              {variant.color}
            </Badge>
          )}
          {variant.size?.trim() && (
            <Badge variant='secondary' className='font-normal'>
              {variant.size}
            </Badge>
          )}
          {!variant.color?.trim() && !variant.size?.trim() && <span className='text-muted-foreground'>-</span>}
        </div>
      </TableCell>
      <TableCell className='whitespace-nowrap text-right font-medium'>
        {price ?? t('products.detail.priceUnknown')}
      </TableCell>
      <TableCell className='whitespace-nowrap text-right tabular-nums'>{stock ?? '-'}</TableCell>
      <TableCell>
        <Badge
          variant='secondary'
          className={cn(
            'gap-1.5 whitespace-nowrap font-medium',
            active
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
              : ''
          )}
        >
          <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
          {statusText}
        </Badge>
      </TableCell>
    </TableRow>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className='absolute inset-0 overflow-y-auto bg-muted/30'>
      <div className='space-y-5 px-4 pt-6 sm:px-6 lg:px-8'>
        <Skeleton className='h-5 w-72' />
        <div className='space-y-2'>
          <Skeleton className='h-8 w-80' />
          <Skeleton className='h-4 w-56' />
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-[82px] w-full rounded-2xl' />
          ))}
        </div>
        <div className='flex gap-2 border-b'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-10 w-28' />
          ))}
        </div>
      </div>
      <div className='grid w-full gap-6 px-4 py-6 sm:px-6 lg:px-8'>
        <Skeleton className='h-56 w-full rounded-xl' />
        <div className='space-y-4'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-48 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
}
