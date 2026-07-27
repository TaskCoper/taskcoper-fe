import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { PinnedProduct } from '../types'
import { PinnedProductCard } from './pinned-product-card'

interface SortablePinnedProductCardProps {
  product: PinnedProduct
  t: TenantT
  /** Disables dragging (sortable). */
  disabled?: boolean
  onUnpin?: (product: PinnedProduct) => void
  isUnpinning?: boolean
  /** Disables the unpin button while any pin/move is in flight. */
  isBusy?: boolean
}

export function SortablePinnedProductCard({
  product,
  t,
  disabled,
  onUnpin,
  isUnpinning,
  isBusy
}: SortablePinnedProductCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: product.productId,
    data: { type: 'PinnedProduct', product },
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='touch-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      {...attributes}
      {...listeners}
    >
      <PinnedProductCard
        product={product}
        t={t}
        onUnpin={onUnpin}
        isUnpinning={isUnpinning}
        disabled={isBusy}
        className='cursor-grab active:cursor-grabbing'
      />
    </div>
  )
}
