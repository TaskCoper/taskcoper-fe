import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { EyeOffIcon, GripVerticalIcon, ImageIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router'
import type { PinnedProduct } from '../types'
import { vndFormatter } from '../utils'

export type PinnedBoardView = 'grid' | 'list'

interface PinnedProductCardProps {
  product: PinnedProduct
  t: TenantT
  /** 1-based position in the full list, rendered as the `#n` badge. */
  position?: number
  /** Absolute path to the product detail page. Omit to render the card as plain, unlinked content. */
  href?: string
  isOverlay?: boolean
  /** A write touching this card is in flight - shown, never disabled. */
  isPending?: boolean
  /** Sits past the storefront cut-off, so it won't actually surface. */
  isBeyondFold?: boolean
  /** Props for the drag activator - spread from the sortable wrapper. Omit to render no handle. */
  dragHandleProps?: ComponentProps<'button'>
  /** The `⋮` actions menu, injected so this component stays presentational. */
  actions?: ReactNode
  view?: PinnedBoardView
  className?: string
}

export function PinnedProductCard({
  product,
  t,
  position,
  href,
  isOverlay = false,
  isPending = false,
  isBeyondFold = false,
  dragHandleProps,
  actions,
  view = 'grid',
  className
}: PinnedProductCardProps) {
  const { coverImage, productName, productCode, price, oldPrice } = product
  const name = productName?.trim() || t('products.common.unnamed')
  const isList = view === 'list'

  const image = coverImage ? (
    <img
      src={coverImage}
      alt={name}
      loading='lazy'
      draggable={false}
      className='size-full object-cover transition-transform duration-200 group-hover:scale-105'
    />
  ) : (
    <span className='flex size-full items-center justify-center'>
      <ImageIcon className={cn('text-muted-foreground/40', isList ? 'size-5' : 'size-8')} />
    </span>
  )

  const title = <p className={cn('font-medium', isList ? 'truncate' : 'line-clamp-2')}>{name}</p>

  const priceRow = (
    <div className={cn('flex items-baseline gap-2', isList ? '' : 'mt-1')}>
      <span className='font-bold text-primary'>
        {price != null ? vndFormatter.format(price) : t('products.common.noData')}
      </span>
      {oldPrice != null && oldPrice > (price ?? 0) && (
        <span className='text-xs text-muted-foreground line-through'>{vndFormatter.format(oldPrice)}</span>
      )}
    </div>
  )

  return (
    <Card
      className={cn(
        'group relative gap-0 overflow-hidden py-0 transition-all',
        // List rows reserve a left gutter for the handle so it doesn't sit on top of the thumbnail.
        isList ? 'flex-row items-center gap-3 py-1 pl-10 pr-3' : '',
        isOverlay
          ? 'ring-primary ring-2 ring-offset-2 shadow-lg'
          : 'hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:shadow-md',
        isPending && 'opacity-90 ring-1 ring-primary/40',
        isBeyondFold && !isOverlay && 'opacity-60',
        className
      )}
    >
      {/* Explicit activator: the whole card used to be the drag surface, which stole text selection,
          fought page scroll on touch, and left the keyboard path invisible. */}
      {dragHandleProps && (
        <button
          type='button'
          aria-label={t('products.pinned.dragHandle')}
          title={t('products.pinned.dragHandle')}
          className={cn(
            'absolute z-10 flex size-8 cursor-grab touch-none items-center justify-center rounded-md',
            'bg-background/80 text-muted-foreground opacity-60 shadow-sm backdrop-blur-sm transition-opacity',
            'hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring active:cursor-grabbing',
            isList ? 'left-1 top-1/2 -translate-y-1/2 shadow-none' : 'left-2 top-2'
          )}
          {...dragHandleProps}
        >
          <GripVerticalIcon className='size-4' />
        </button>
      )}

      <div
        className={cn(
          'absolute z-10 flex items-center gap-1.5',
          isList ? 'right-2 top-1/2 -translate-y-1/2' : 'right-2 top-2'
        )}
      >
        {isPending && (
          <span className='rounded-md bg-background/80 p-1.5 shadow-sm backdrop-blur-sm'>
            <Spinner className='size-4' />
          </span>
        )}
        {isOverlay ? (
          <span className='rounded-md bg-background/70 p-1 text-muted-foreground backdrop-blur-sm'>
            <GripVerticalIcon className='size-4' />
          </span>
        ) : (
          actions
        )}
      </div>

      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-muted',
          isList ? 'size-14 rounded-md' : 'aspect-square w-full'
        )}
      >
        {href && !isOverlay ? (
          <Link to={href} className='block size-full' tabIndex={-1} aria-hidden>
            {image}
          </Link>
        ) : (
          image
        )}

        {position != null && (
          <span className='absolute bottom-1.5 left-1.5 rounded-md bg-background/85 px-1.5 py-0.5 font-mono text-xs font-medium shadow-sm backdrop-blur-sm'>
            {t('products.pinned.positionBadge', { position })}
          </span>
        )}

        {isBeyondFold && !isOverlay && !isList && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='absolute bottom-1.5 right-1.5 rounded-md bg-background/85 p-1 text-muted-foreground shadow-sm backdrop-blur-sm'>
                <EyeOffIcon className='size-3.5' />
              </span>
            </TooltipTrigger>
            <TooltipContent>{t('products.pinned.fold.below')}</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-col', isList ? 'flex-1 gap-0.5 pr-10' : 'gap-2 p-3')}>
        <div className=''>
          {href && !isOverlay ? (
            <Link
              to={href}
              className='truncate rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            >
              {title}
            </Link>
          ) : (
            title
          )}
          {productCode?.trim() && <p className='truncate text-xs text-muted-foreground'>{productCode}</p>}
        </div>

        {priceRow}
      </div>
    </Card>
  )
}
