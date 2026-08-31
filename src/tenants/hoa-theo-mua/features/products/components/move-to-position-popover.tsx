import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useState, type ReactNode } from 'react'

interface MoveToPositionPopoverProps {
  t: TenantT
  /** Current 1-based position, used to seed the input. */
  currentPosition: number
  total: number
  /** Receives a 0-based index. */
  onMove: (toIndex: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Element the popover positions itself against - not a trigger; the dropdown item opens it. */
  children: ReactNode
}

/**
 * Jump a product to an absolute position by typing the number.
 *
 * The escape hatch for everything dragging is bad at: a long list where the target is off-screen, and
 * the one-column mobile layout where a drag has to fight the page scroll for the whole journey.
 */
export function MoveToPositionPopover({
  t,
  currentPosition,
  total,
  onMove,
  open,
  onOpenChange,
  children
}: MoveToPositionPopoverProps) {
  const [value, setValue] = useState(String(currentPosition))

  // Re-seed the input whenever the card's position changes underneath an open popover.
  const [lastPosition, setLastPosition] = useState(currentPosition)
  if (lastPosition !== currentPosition) {
    setLastPosition(currentPosition)
    setValue(String(currentPosition))
  }

  const parsed = Number(value)
  const isValid = Number.isInteger(parsed) && parsed >= 1 && parsed <= total

  const submit = () => {
    if (!isValid) return

    onMove(parsed - 1)
    onOpenChange(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setValue(String(currentPosition))
      }}
    >
      <PopoverAnchor asChild>{children}</PopoverAnchor>

      <PopoverContent className='w-64 space-y-3' align='end'>
        <div className='space-y-1.5'>
          <Label htmlFor='move-to-position'>{t('products.pinned.move.positionLabel', { max: total })}</Label>
          <Input
            id='move-to-position'
            type='number'
            min={1}
            max={total}
            value={value}
            autoFocus
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              submit()
            }}
          />
          {!isValid && value !== '' && (
            <p className='text-xs text-destructive'>{t('products.pinned.move.invalid', { max: total })}</p>
          )}
        </div>

        <Button type='button' size='sm' className='w-full' disabled={!isValid} onClick={submit}>
          {t('products.pinned.move.apply')}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
