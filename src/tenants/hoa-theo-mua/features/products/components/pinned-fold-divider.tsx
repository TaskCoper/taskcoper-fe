import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { ScissorsIcon } from 'lucide-react'

interface PinnedFoldDividerProps {
  t: TenantT
  count: number
}

/**
 * Marks where the storefront stops rendering the category's product grid (`rows × cols` from the
 * category metadata). Everything below it is pinned but invisible to shoppers - worth showing, since
 * otherwise the only way to find out is to open the storefront and count.
 */
export function PinnedFoldDivider({ t, count }: PinnedFoldDividerProps) {
  return (
    <div className='col-span-full flex items-center gap-3 py-1' aria-hidden>
      <span className='h-px flex-1 bg-border' />
      <span className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
        <ScissorsIcon className='size-3.5' />
        {t('products.pinned.fold.label', { count })}
      </span>
      <span className='h-px flex-1 bg-border' />
    </div>
  )
}
