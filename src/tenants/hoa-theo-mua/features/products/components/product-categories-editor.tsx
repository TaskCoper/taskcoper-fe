import AsyncMultiSelectField from '@/components/async-multi-select-field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { CornerDownRightIcon, FolderIcon, TagIcon, TagsIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { useGetCategories } from '../../categories/hooks/use-get-categories'
import { useUpdateProductCategories } from '../../categories/hooks/use-update-product-categories'
import type { Category } from '../../categories/types'
import { CategoryProductType } from '../../categories/types'
import type { UpdateProductCategoriesFormValues } from '../../categories/validations'
import type { Product } from '../types'

// One form item in `categoryProductLists`.
type CategoryListItem = UpdateProductCategoriesFormValues['categoryProductLists'][number]

/** A category paired with its depth in the tree, so the flat combobox list can indent children under parents. */
interface CategoryOption {
  category: Category
  depth: number
}

// Wide enough that the whole (small) category tree is usually available for search without paging.
const CATEGORY_PAGE_SIZE = 100

/** Depth-first flatten of the (arbitrarily deep) category tree so every child is a selectable option too. */
const flattenCategories = (categories: Category[], depth = 0): CategoryOption[] =>
  categories.flatMap((category) => [{ category, depth }, ...flattenCategories(category.children ?? [], depth + 1)])

interface ProductCategoriesEditorProps {
  product: Product
}

export default function ProductCategoriesEditor({ product }: ProductCategoriesEditorProps) {
  const { t } = useTenantTranslation()

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search.trim(), 300)

  const { categories, isLoadingCategories } = useGetCategories({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: CATEGORY_PAGE_SIZE,
    keyword: debouncedSearch || undefined
  })

  const options = useMemo(() => flattenCategories(categories.value.items), [categories.value.items])

  // Resolve a selected junction's id back to its category name for the badge list. Seed from the product's own
  // categories so already-selected names show even when the current (filtered) search results don't include them.
  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    product.categories.forEach((category) => map.set(category.categoryId, category.name))
    options.forEach(({ category }) => map.set(category.categoryId, category.name))
    return map
  }, [product.categories, options])

  const { methods, updateProductCategories, isUpdatingProductCategories } = useUpdateProductCategories(product)

  const onSubmit = methods.handleSubmit((values) => updateProductCategories(values))

  return (
    <Card className='gap-4 p-5 shadow-none'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <TagsIcon className='size-4 text-muted-foreground' />
          <h2 className='text-sm font-semibold'>{t('products.detail.categories.title')}</h2>
        </div>
        <p className='text-xs text-muted-foreground'>{t('products.detail.categories.description')}</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <AsyncMultiSelectField<UpdateProductCategoriesFormValues, CategoryListItem, CategoryOption>
            name='categoryProductLists'
            items={options}
            isLoading={isLoadingCategories}
            searchValue={search}
            onSearchChange={setSearch}
            placeholder='products.detail.categories.placeholder'
            closeOnSelect={false}
            renderSelectedLabel={(item) => categoryNameById.get(item.categoryProductId) ?? item.categoryProductId}
            getId={({ category }) => category.categoryId}
            getValueId={(item) => item.categoryProductId}
            getLabel={({ category }) => category.name}
            createValue={({ category }) => ({
              categoryProductId: category.categoryId,
              isPin: false,
              position: category.position ?? 0
            })}
            renderOption={({ category, depth }) => {
              const hasChildren = (category.children?.length ?? 0) > 0
              return (
                <span className='flex min-w-0 items-center gap-1.5' style={{ paddingLeft: depth * 16 }}>
                  {depth > 0 && <CornerDownRightIcon className='size-3.5 shrink-0 text-muted-foreground/60' />}
                  {hasChildren ? (
                    <FolderIcon className='size-4 shrink-0 text-muted-foreground' />
                  ) : (
                    <TagIcon className='size-4 shrink-0 text-muted-foreground' />
                  )}
                  <span className='truncate'>{category.name}</span>
                  {category.type === CategoryProductType.Campaign && (
                    <Badge variant='secondary' className='shrink-0 font-normal'>
                      {t('productCategories.type.campaign')}
                    </Badge>
                  )}
                </span>
              )
            }}
          />

          <div className='flex justify-end'>
            <Button type='submit' disabled={isUpdatingProductCategories || !methods.formState.isDirty}>
              {t('products.detail.categories.save')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  )
}
