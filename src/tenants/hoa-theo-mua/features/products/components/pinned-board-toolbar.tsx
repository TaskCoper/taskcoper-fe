import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { LayoutGridIcon, ListIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react'
import type { CategoryTreeLikeNode } from '../../categories/components/category-tree-picker'
import PinnedCategoryFilter from './pinned-category-filter'
import type { PinnedBoardView } from './pinned-product-card'

const VIEW_OPTIONS = [
  { value: 'grid', icon: LayoutGridIcon, labelKey: 'products.pinned.view.grid' },
  { value: 'list', icon: ListIcon, labelKey: 'products.pinned.view.list' }
] as const satisfies readonly { value: PinnedBoardView; icon: typeof LayoutGridIcon; labelKey: string }[]

interface PinnedBoardToolbarProps {
  t: TenantT
  categories: CategoryTreeLikeNode[]
  isLoadingCategories?: boolean
  categoryId: string | null
  onCategoryChange: (categoryId: string | null) => void
  filteredCount: number
  isFiltering: boolean
  search: string
  onSearchChange: (value: string) => void
  view: PinnedBoardView
  onViewChange: (view: PinnedBoardView) => void
  onAddProducts: () => void
}

export function PinnedBoardToolbar({
  t,
  categories,
  isLoadingCategories,
  categoryId,
  onCategoryChange,
  isFiltering,
  search,
  onSearchChange,
  view,
  onViewChange,
  onAddProducts
}: PinnedBoardToolbarProps) {
  return (
    <div className='space-y-3'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='relative w-full sm:max-w-xs'>
          <SearchIcon className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('products.pinned.searchPlaceholder')}
            className={cn('pl-8', search && 'pr-8')}
          />
          {search && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={t('products.pinned.clearSearch')}
              onClick={() => onSearchChange('')}
              className='absolute right-0.5 top-1/2 size-7 -translate-y-1/2'
            >
              <XIcon />
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <PinnedCategoryFilter
            t={t}
            categories={categories}
            isLoading={isLoadingCategories}
            value={categoryId}
            onChange={onCategoryChange}
          />

          <div
            role='group'
            aria-label={t('products.pinned.view.label')}
            className='flex gap-0.5 rounded-xl border bg-muted p-0.5'
          >
            {VIEW_OPTIONS.map(({ value, icon: Icon, labelKey }) => {
              const isActive = view === value

              return (
                <Button
                  key={value}
                  type='button'
                  variant={isActive ? 'default' : 'ghost'}
                  size='icon-sm'
                  aria-pressed={isActive}
                  aria-label={t(labelKey)}
                  title={t(labelKey)}
                  onClick={() => onViewChange(value)}
                  className={cn(!isActive && 'text-muted-foreground hover:text-foreground')}
                >
                  <Icon className='size-4' />
                </Button>
              )
            })}
          </div>

          <Button type='button' onClick={onAddProducts}>
            <PlusIcon data-icon='inline-start' />
            {t('products.pinned.add.trigger')}
          </Button>
        </div>
      </div>

      {isFiltering ? (
        <p className='flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
          {t('products.pinned.dragDisabledWhileSearching')}
          <Button type='button' variant='link' size='sm' className='h-auto p-0' onClick={() => onSearchChange('')}>
            {t('products.pinned.clearSearch')}
          </Button>
        </p>
      ) : null}
    </div>
  )
}
