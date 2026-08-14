import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CategoryProductPageLabel, CategoryProductType, parseCategoryMetadata, type Category } from '../types'

const CATEGORY_I18N_PREFIX = 'productCategories' as const

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

export function CategoryPageBadges({ page, t }: { page: Category['page']; t: TenantT }) {
  if (!page?.length) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-1'>
      {page.map((p) => (
        <Badge key={p} variant='outline' className='font-normal'>
          {t(CategoryProductPageLabel[p])}
        </Badge>
      ))}
    </div>
  )
}

export function CategoryWindow({
  category,
  t
}: {
  category: Pick<Category, 'type' | 'startTime' | 'endTime'>
  t: TenantT
}) {
  if (category.type !== CategoryProductType.Campaign) {
    return null
  }

  const start = formatDateTime(category.startTime)
  const end = formatDateTime(category.endTime)

  if (!start && !end) return null

  return (
    <span className='whitespace-nowrap text-xs text-muted-foreground'>
      {start || t(`${CATEGORY_I18N_PREFIX}.window.open`)} - {end || t(`${CATEGORY_I18N_PREFIX}.window.open`)}
    </span>
  )
}

export function CategoryFilterBadges({
  category,
  t
}: {
  category: Pick<Category, 'metaData' | 'parentId'>
  t: TenantT
}) {
  const metadata = parseCategoryMetadata(category.metaData)
  // A parent category renders the name/price filter toggles; a child renders `isFilterable`.
  const badges = category.parentId
    ? metadata.isFilterable
      ? [t(`${CATEGORY_I18N_PREFIX}.form.isFilterableLabel`)]
      : []
    : [
        metadata.filterByName && t(`${CATEGORY_I18N_PREFIX}.form.filterByNameLabel`),
        metadata.filterByPrice && t(`${CATEGORY_I18N_PREFIX}.form.filterByPriceLabel`)
      ].filter((label): label is string => !!label)

  if (!badges.length) {
    return <span className='text-xs text-muted-foreground'>-</span>
  }

  return (
    <div className='flex flex-wrap gap-1'>
      {badges.map((label) => (
        <Badge key={label} variant='outline' className='font-normal'>
          {label}
        </Badge>
      ))}
    </div>
  )
}

export function CategoryGridLabel({ category, t }: { category: Pick<Category, 'metaData'>; t: TenantT }) {
  const metadata = parseCategoryMetadata(category.metaData)

  if (!metadata.rows && !metadata.cols) {
    return <span className='text-xs text-muted-foreground'>-</span>
  }

  return (
    <span className='inline-flex items-center gap-1.5 whitespace-nowrap text-sm tabular-nums'>
      <span>
        {metadata.rows ?? 1} {t(`${CATEGORY_I18N_PREFIX}.column.gridRow`)}
      </span>
      <span className='text-muted-foreground'>×</span>
      <span>
        {metadata.cols ?? 4} {t(`${CATEGORY_I18N_PREFIX}.column.gridCol`)}
      </span>
    </span>
  )
}
