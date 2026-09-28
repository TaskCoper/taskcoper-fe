import { Input } from '@/components/ui/input'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { OTHER_CATEGORY_PREFIX } from '../../config-registry'
import { slugify } from '../../palette-shared'
import { CATEGORY_SECTIONS, type CategoryId, type CategorySection, type Config, type ConfigCategory } from '../../types'
import { iconForCategory } from './category-icons'

export interface ConfigsNavProps {
  categories: readonly ConfigCategory[]
  recordsByCategory: Map<CategoryId, Config[]>
  activeCategory: CategoryId
  onSelect: (id: CategoryId) => void
  dirtyCategories?: ReadonlySet<CategoryId>
  className?: string
}

const matches = (haystack: string, needle: string) => slugify(haystack).includes(needle)

export default function ConfigsNav({
  categories,
  recordsByCategory,
  activeCategory,
  onSelect,
  dirtyCategories,
  className
}: ConfigsNavProps) {
  const { t } = useTenantTranslation()
  const [search, setSearch] = useState('')

  const labelOf = (category: ConfigCategory) =>
    category.labelKey ? t(category.labelKey) : (category.fallbackLabel ?? category.id)

  const needle = slugify(search.trim())

  const visible = useMemo(() => {
    if (!needle) return categories.map((category) => ({ category, contentMatches: 0 }))

    return categories
      .map((category) => {
        const records = recordsByCategory.get(category.id) ?? []
        const contentMatches = records.filter(
          (config) => matches(config.key, needle) || matches(config.value?.label ?? '', needle)
        ).length
        const labelHit =
          matches(category.labelKey ? t(category.labelKey) : (category.fallbackLabel ?? ''), needle) ||
          matches(category.id.replace(OTHER_CATEGORY_PREFIX, ''), needle)

        return { category, contentMatches, visible: labelHit || contentMatches > 0 }
      })
      .filter((entry) => entry.visible || entry.category.id === activeCategory)
  }, [categories, recordsByCategory, needle, activeCategory, t])

  const bySection = useMemo(() => {
    const map = new Map<CategorySection, typeof visible>()
    for (const entry of visible) {
      const bucket = map.get(entry.category.section)
      if (bucket) bucket.push(entry)
      else map.set(entry.category.section, [entry])
    }
    return map
  }, [visible])

  return (
    <nav aria-label={t('configsPage.nav.label')} className={cn('flex min-h-0 flex-col gap-2', className)}>
      <div className='shrink-0 p-2'>
        <div className='relative'>
          <Search className='pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setSearch('')
            }}
            placeholder={t('configsPage.nav.searchPlaceholder')}
            aria-label={t('configsPage.nav.searchPlaceholder')}
            className='h-8 pl-8 text-sm'
          />
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {visible.length === 0 ? (
          <p className='px-2 py-6 text-center text-xs text-muted-foreground'>{t('configsPage.nav.noMatches')}</p>
        ) : (
          CATEGORY_SECTIONS.filter((section) => bySection.has(section)).map((section) => (
            <div key={section} className='mb-6 last:mb-0'>
              <div className='mb-1 px-4 text-[0.85rem] font-medium'>{t(`configsPage.navSection.${section}`)}</div>

              <div className='space-y-0.5 px-2'>
                {(bySection.get(section) ?? []).map(({ category }) => {
                  const isActive = category.id === activeCategory
                  const Icon = iconForCategory(category.id)

                  return (
                    <button
                      key={category.id}
                      type='button'
                      onClick={() => onSelect(category.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors last:mb-2',
                        isActive
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                    >
                      <Icon
                        aria-hidden='true'
                        className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
                      />

                      <span className={cn('min-w-0 flex-1 truncate', isActive ? 'text-primary' : 'text-foreground/80')}>
                        {labelOf(category)}
                      </span>

                      {dirtyCategories?.has(category.id) && (
                        <span
                          className='size-1.5 shrink-0 rounded-full bg-amber-500 dark:bg-amber-400'
                          aria-label={t('configsPage.nav.hasUnsaved')}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </nav>
  )
}
