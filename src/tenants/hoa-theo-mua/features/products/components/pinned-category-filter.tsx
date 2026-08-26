import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { LayoutGridIcon } from 'lucide-react'
import CategoryTreePicker from '../../categories/components/category-tree-picker'
import { useGetSortableCategories } from '../../categories/hooks/use-get-sortable-categories'

interface PinnedCategoryFilterProps {
  value: string | null
  onChange: (categoryId: string | null) => void
  disabled?: boolean
}

export default function PinnedCategoryFilter({ value, onChange, disabled }: PinnedCategoryFilterProps) {
  const { t } = useTenantTranslation()
  const { sortableCategories, isLoadingSortableCategories } = useGetSortableCategories()

  return (
    <div className='w-full max-w-xs space-y-1'>
      <p className='text-sm font-medium'>{t('products.pinned.categoryFilter.label')}</p>

      <CategoryTreePicker
        categories={sortableCategories}
        value={value}
        onChange={onChange}
        t={t}
        disabled={disabled}
        isLoading={isLoadingSortableCategories}
        emptyLabel={t('products.pinned.categoryFilter.empty')}
        rootOption={{
          icon: <LayoutGridIcon className='size-4 shrink-0 text-muted-foreground' />,
          label: t('products.pinned.categoryFilter.all')
        }}
      />
    </div>
  )
}
