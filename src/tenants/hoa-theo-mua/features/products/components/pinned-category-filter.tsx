import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { LayoutGridIcon } from 'lucide-react'
import CategoryTreePicker, { type CategoryTreeLikeNode } from '../../categories/components/category-tree-picker'

interface PinnedCategoryFilterProps {
  t: TenantT
  /**
   * The category tree, passed in rather than fetched here - the board also reads it to resolve the
   * storefront cut-off, and one shared query beats two.
   */
  categories: CategoryTreeLikeNode[]
  isLoading?: boolean
  value: string | null
  onChange: (categoryId: string | null) => void
}

/**
 * Picks which pin list the board is editing. Each scope keeps its **own** independent list and
 * ordering - the root option is the storefront homepage, not a union of every category's pins.
 */
export default function PinnedCategoryFilter({ t, categories, isLoading, value, onChange }: PinnedCategoryFilterProps) {
  return (
    <CategoryTreePicker
      categories={categories}
      value={value}
      onChange={onChange}
      t={t}
      isLoading={isLoading}
      emptyLabel={t('products.pinned.categoryFilter.empty')}
      rootOption={{
        icon: <LayoutGridIcon className='size-4 shrink-0 text-muted-foreground' />,
        label: t('products.pinned.categoryFilter.all')
      }}
    />
  )
}
