import { DataTableFilterTrigger } from '@/components/data-table/data-table-filter-trigger'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { Column } from '@tanstack/react-table'
import { PlusCircleIcon } from 'lucide-react'
import { useState } from 'react'
import CategoryTreeMultiPicker from '../../categories/components/category-tree-multi-picker'
import { useGetSortableCategories } from '../../categories/hooks/use-get-sortable-categories'
import type { Product } from '../types'
import { localizeProductCategories } from './product-category-labels'

interface CategoriesColumnFilterProps {
  column: Column<Product, unknown>
  title: string
}

export default function CategoriesColumnFilter({ column, title }: CategoriesColumnFilterProps) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = useState(false)
  const { sortableCategories, isLoadingSortableCategories } = useGetSortableCategories()
  const localizedCategories = localizeProductCategories(sortableCategories, t)

  const filterValue = column.getFilterValue()
  const selectedIds = new Set(Array.isArray(filterValue) ? (filterValue as string[]) : [])

  const onToggle = (categoryId: string) => {
    const next = new Set(selectedIds)
    if (next.has(categoryId)) next.delete(categoryId)
    else next.add(categoryId)
    const values = Array.from(next)
    column.setFilterValue(values.length ? values : undefined)
  }

  const onReset = (event?: React.MouseEvent) => {
    event?.stopPropagation()
    column.setFilterValue(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <DataTableFilterTrigger
          hasValue={selectedIds.size > 0}
          clearLabel={t('dataTable.filter.clearSpecificFilter', { title })}
          emptyIcon={<PlusCircleIcon />}
          onClear={onReset}
          className='pl-2 pr-1'
        >
          {title}
          {selectedIds.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
              <Badge variant='outline' className='rounded-sm px-1 font-normal'>
                {selectedIds.size} {t('dataTable.filter.selected')}
              </Badge>
            </>
          )}
        </DataTableFilterTrigger>
      </PopoverTrigger>

      <PopoverContent align='start' sideOffset={8} className='w-96 p-1'>
        <CategoryTreeMultiPicker
          categories={localizedCategories}
          selectedIds={selectedIds}
          onToggle={onToggle}
          t={t}
          isLoading={isLoadingSortableCategories}
          emptyLabel={t('products.pinned.categoryFilter.empty')}
        />
      </PopoverContent>
    </Popover>
  )
}
