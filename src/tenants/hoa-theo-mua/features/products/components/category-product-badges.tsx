import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CategoryProductType, type CategoryProduct } from '../types'

const CATEGORY_I18N_PREFIX = 'productCategories' as const

/** Fix / Campaign pill — campaign categories get a distinct accent so time-bound groups stand out. */
export function CategoryTypeBadge({ type, t }: { type: CategoryProductType; t: TenantT }) {
  const isCampaign = type === CategoryProductType.Campaign

  return (
    <Badge
      variant='outline'
      className={cn(
        'font-medium',
        isCampaign
          ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-400'
          : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-400'
      )}
    >
      {t(`${CATEGORY_I18N_PREFIX}.type.${isCampaign ? 'campaign' : 'fix'}`)}
    </Badge>
  )
}

/** Active / inactive dot chip mirroring the storefront status treatment. */
export function CategoryStatusBadge({ isActive, t }: { isActive: boolean; t: TenantT }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
          : 'border-muted-foreground/20 bg-muted text-muted-foreground'
      )}
    >
      <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
      {t(`${CATEGORY_I18N_PREFIX}.status.${isActive ? 'active' : 'inactive'}`)}
    </span>
  )
}

/** Render the campaign window, or a muted dash for non-campaign / undated categories. */
export function CategoryWindow({ category, t }: { category: CategoryProduct; t: TenantT }) {
  if (category.type !== CategoryProductType.Campaign) {
    return <span className='text-muted-foreground/50'>—</span>
  }

  const start = formatDateTime(category.startTime)
  const end = formatDateTime(category.endTime)

  if (!start && !end) return <span className='text-muted-foreground/50'>—</span>

  return (
    <span className='whitespace-nowrap text-xs text-muted-foreground'>
      {start || t(`${CATEGORY_I18N_PREFIX}.window.open`)} - {end || t(`${CATEGORY_I18N_PREFIX}.window.open`)}
    </span>
  )
}
