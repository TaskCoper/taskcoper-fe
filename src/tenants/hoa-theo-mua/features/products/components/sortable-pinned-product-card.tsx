import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import type { PinnedProduct } from '../types'
import { PinnedProductCard, type PinnedBoardView } from './pinned-product-card'

interface SortablePinnedProductCardProps {
  product: PinnedProduct
  t: TenantT
  position: number
  href: string
  actions?: ReactNode
  isPending?: boolean
  isBeyondFold?: boolean
  view?: PinnedBoardView
}

export function SortablePinnedProductCard({
  product,
  t,
  position,
  href,
  actions,
  isPending,
  isBeyondFold,
  view
}: SortablePinnedProductCardProps) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: product.productId,
    data: { type: 'PinnedProduct', product }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className='select-none'>
      <PinnedProductCard
        product={product}
        t={t}
        position={position}
        href={href}
        actions={actions}
        isPending={isPending}
        isBeyondFold={isBeyondFold}
        view={view}
        // `setActivatorNodeRef` is what points the keyboard sensor at the handle, so lifting a card
        // with Space announces from the button the user actually focused.
        dragHandleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </div>
  )
}
