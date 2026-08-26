import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
  ExternalLinkIcon,
  HashIcon,
  MoreVerticalIcon,
  PinOffIcon
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { MoveToPositionPopover } from './move-to-position-popover'

interface PinnedProductActionsMenuProps {
  t: TenantT
  /** 0-based index within the **full** list, not the filtered view. */
  index: number
  total: number
  productHref: string
  /** Receives a 0-based index in the full list. */
  onMoveToIndex: (toIndex: number) => void
  onUnpin: () => void
}

/**
 * Per-card actions: reposition without dragging, open the product, unpin.
 *
 * Unpin lives behind this menu rather than a bare hover-revealed icon - it used to be a single click
 * on the surface the user is constantly mousing over while sorting. One deliberate click plus the
 * undo toast keeps it reversible without a modal confirm, which would be worse for bulk curation.
 *
 * Every move addresses an absolute index in the full list, so these stay usable (and unambiguous)
 * while the board's search filter has dragging turned off.
 */
export function PinnedProductActionsMenu({
  t,
  index,
  total,
  productHref,
  onMoveToIndex,
  onUnpin
}: PinnedProductActionsMenuProps) {
  const [isMoveOpen, setIsMoveOpen] = useState(false)

  const isFirst = index === 0
  const isLast = index === total - 1

  return (
    <MoveToPositionPopover
      t={t}
      currentPosition={index + 1}
      total={total}
      open={isMoveOpen}
      onOpenChange={setIsMoveOpen}
      onMove={onMoveToIndex}
    >
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='secondary'
              size='icon'
              aria-label={t('products.pinned.card.actions')}
              title={t('products.pinned.card.actions')}
              // Keep the pointer from starting a drag on the sortable wrapper.
              onPointerDown={(event) => event.stopPropagation()}
              className='size-8 rounded-md opacity-70 shadow-sm transition-opacity hover:opacity-100 focus-visible:opacity-100'
            >
              <MoreVerticalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='end'
            className='w-56'
            // The move-to-position item opens the popover instead of closing the menu outright;
            // suppress the dropdown's default refocus-on-close so it doesn't steal focus back
            // from the popover's input while both are mid-transition.
            onCloseAutoFocus={(event) => {
              if (isMoveOpen) event.preventDefault()
            }}
          >
            <DropdownMenuItem asChild>
              <Link to={productHref}>
                <ExternalLinkIcon />
                {t('products.pinned.card.openProduct')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled={isFirst} onSelect={() => onMoveToIndex(0)}>
              <ChevronsUpIcon />
              {t('products.pinned.move.top')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isFirst} onSelect={() => onMoveToIndex(index - 1)}>
              <ChevronUpIcon />
              {t('products.pinned.move.up')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onSelect={() => onMoveToIndex(index + 1)}>
              <ChevronDownIcon />
              {t('products.pinned.move.down')}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onSelect={() => onMoveToIndex(total - 1)}>
              <ChevronsDownIcon />
              {t('products.pinned.move.bottom')}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={total < 2}
              // Let the menu close as usual - onCloseAutoFocus above stops it from
              // stealing focus back from the popover that's opening.
              onSelect={() => setIsMoveOpen(true)}
            >
              <HashIcon />
              {t('products.pinned.move.toPosition')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant='destructive' onSelect={onUnpin}>
              <PinOffIcon />
              {t('products.pinned.unpin.action')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </MoveToPositionPopover>
  )
}
