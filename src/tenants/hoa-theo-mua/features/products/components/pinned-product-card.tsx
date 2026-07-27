import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { GripVerticalIcon, ImageIcon, PinOffIcon } from 'lucide-react'
import type { PinnedProduct } from '../types'
import { vndFormatter } from '../utils'

interface PinnedProductCardProps {
  product: PinnedProduct
  t: TenantT
  isOverlay?: boolean
  className?: string
  onUnpin?: (product: PinnedProduct) => void
  isUnpinning?: boolean
  /** Disable the unpin action while any pin/move on the page is in flight (only this card spins). */
  disabled?: boolean
  /** 1-based rank in the pinned grid, shown as a badge (1, 2, 3, 4, …). */
  position?: number
}

/**
 * Presentational card for a single pinned product — cover image, name, code and price.
 * The DnD wrapping lives in `SortablePinnedProductCard`; the overlay variant reuses this
 * with `isOverlay` so the dragged card matches the grid card exactly.
 */
export function PinnedProductCard({
  product,
  t,
  isOverlay = false,
  className,
  onUnpin,
  isUnpinning = false,
  disabled = false,
  position
}: PinnedProductCardProps) {
  const { coverImage, productName, productCode, price, oldPrice } = product

  return (
    <Card
      className={cn(
        'group relative gap-0 overflow-hidden py-0 transition-shadow',
        isOverlay ? 'border-primary shadow-lg' : 'hover:border-primary/60 hover:shadow-md',
        className
      )}
    >
      <div className='absolute right-2 top-2 z-10 flex items-center gap-1.5'>
        {position != null && (
          <span className='flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm'>
            {position}
          </span>
        )}

        {onUnpin && !isOverlay ? (
          <Button
            type='button'
            variant='secondary'
            size='icon'
            disabled={disabled || isUnpinning}
            aria-label={t('products.action.unpin')}
            title={t('products.action.unpin')}
            // Stop the pointer from starting a drag on the sortable wrapper.
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onUnpin(product)}
            className='size-8 rounded-md opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100'
          >
            {isUnpinning ? <Spinner className='size-4' /> : <PinOffIcon className='size-4' />}
          </Button>
        ) : (
          <span className='rounded-md bg-background/70 p-1 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'>
            <GripVerticalIcon className='size-4' />
          </span>
        )}
      </div>

      <div className='aspect-square w-full overflow-hidden bg-muted'>
        {coverImage ? (
          <img
            src={coverImage}
            alt={productName ?? ''}
            loading='lazy'
            draggable={false}
            className='size-full object-cover transition-transform duration-200 group-hover:scale-105'
          />
        ) : (
          <span className='flex size-full items-center justify-center'>
            <ImageIcon className='size-8 text-muted-foreground/40' />
          </span>
        )}
      </div>

      <div className='flex flex-col gap-1 p-3'>
        <p className='line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight'>
          {productName?.trim() || t('products.common.unnamed')}
        </p>
        {productCode?.trim() && <p className='truncate font-mono text-xs text-muted-foreground'>{productCode}</p>}
        <div className='mt-1 flex items-baseline gap-2'>
          <span className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
            {price != null ? vndFormatter.format(price) : t('products.common.noData')}
          </span>
          {oldPrice != null && oldPrice > (price ?? 0) && (
            <span className='text-xs text-muted-foreground line-through'>{vndFormatter.format(oldPrice)}</span>
          )}
        </div>
      </div>
    </Card>
  )
}
