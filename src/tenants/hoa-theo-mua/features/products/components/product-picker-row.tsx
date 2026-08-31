import { Checkbox } from '@/components/ui/checkbox'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ImageIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface ProductPickerRowProps {
  t: TenantT
  productName: string | null
  productCode: string | null
  coverImage: string | null
  /** Pre-formatted price string - callers own the raw-vs-parsed difference between product shapes. */
  price: string | null
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Locks the checkbox - e.g. a product already pinned in the target scope. */
  disabled?: boolean
  /** Status chip rendered before the price (already pinned, not in this category, …). */
  badge?: ReactNode
}

/**
 * One selectable product in a picker list. Shared by the category assign dialog and the pinned-board
 * add sheet so both stay visually identical as either grows new affordances.
 */
export function ProductPickerRow({
  t,
  productName,
  productCode,
  coverImage,
  price,
  checked,
  onCheckedChange,
  disabled = false,
  badge
}: ProductPickerRowProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 transition-colors',
        disabled ? 'cursor-default opacity-70' : 'cursor-pointer hover:bg-accent',
        checked && 'bg-primary/5'
      )}
    >
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={(value) => onCheckedChange(!!value)} />

      <span className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted'>
        {coverImage ? (
          <img src={coverImage} alt={productName ?? ''} loading='lazy' className='size-full object-cover' />
        ) : (
          <ImageIcon className='size-4 text-muted-foreground/40' />
        )}
      </span>

      <span className='min-w-0 flex-1'>
        <span className='block truncate text-sm font-medium'>
          {productName?.trim() || t('products.common.unnamed')}
        </span>
        {productCode?.trim() && (
          <span className='block truncate font-mono text-xs text-muted-foreground'>{productCode}</span>
        )}
      </span>

      {badge}

      {price && <span className='shrink-0 text-sm font-medium text-emerald-600 dark:text-emerald-400'>{price}</span>}
    </label>
  )
}
