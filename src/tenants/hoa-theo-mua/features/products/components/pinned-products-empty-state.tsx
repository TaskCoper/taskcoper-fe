import { Button } from '@/components/ui/button'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { AlertCircleIcon, PackageOpenIcon, PlusIcon, RotateCcwIcon, SearchXIcon } from 'lucide-react'

interface PinnedProductsEmptyStateProps {
  t: TenantT
  /** `'error'` and `'filtered'` used to render as "no pins yet", which reads as a lie. */
  variant: 'empty' | 'filtered' | 'error'
  search?: string
  onAddProducts: () => void
  onClearSearch: () => void
  onRetry: () => void
}

export function PinnedProductsEmptyState({
  t,
  variant,
  search,
  onAddProducts,
  onClearSearch,
  onRetry
}: PinnedProductsEmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center'>
      {variant === 'error' ? (
        <>
          <AlertCircleIcon className='size-10 text-destructive/60' />
          <p className='text-sm text-muted-foreground'>{t('products.pinned.loadFailed')}</p>
          <Button type='button' variant='outline' onClick={onRetry}>
            <RotateCcwIcon data-icon='inline-start' />
            {t('products.pinned.retry')}
          </Button>
        </>
      ) : variant === 'filtered' ? (
        <>
          <SearchXIcon className='size-10 text-muted-foreground/50' />
          <p className='text-sm text-muted-foreground'>{t('products.pinned.searchEmpty', { query: search ?? '' })}</p>
          <Button type='button' variant='outline' onClick={onClearSearch}>
            {t('products.pinned.clearSearch')}
          </Button>
        </>
      ) : (
        <>
          <PackageOpenIcon className='size-10 text-muted-foreground/50' />
          <div className='space-y-1'>
            <p className='text-sm font-medium'>{t('products.pinned.empty')}</p>
            <p className='text-sm text-muted-foreground'>{t('products.pinned.emptyDescription')}</p>
          </div>
          <Button type='button' onClick={onAddProducts}>
            <PlusIcon data-icon='inline-start' />
            {t('products.pinned.add.trigger')}
          </Button>
        </>
      )}
    </div>
  )
}
