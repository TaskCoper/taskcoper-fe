import AsyncMultiSelectField from '@/components/async-multi-select-field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { CornerDownRightIcon, FolderIcon, TagIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { useGetCategories } from '../../categories/hooks/use-get-categories'
import { useUpdateProductCategories } from '../../categories/hooks/use-update-product-categories'
import type { Category } from '../../categories/types'
import { CategoryProductType } from '../../categories/types'
import type { UpdateProductCategoriesFormValues } from '../../categories/validations'
import type { Product } from '../types'
import { DetailSection } from './product-detail/parts'

type CategoryListItem = UpdateProductCategoriesFormValues['categoryProductLists'][number]

interface CategoryOption {
  category: Category
  depth: number
}

/**
 * The category tree is small, so the whole thing is fetched once and searched in the browser.
 * Server-side `keyword` filtering only ever matched root categories, which made child categories
 * unfindable no matter how exactly their name was typed.
 */
const CATEGORY_PAGE_SIZE = 200

/** Lowercase + strip Vietnamese diacritics so "hoa cuoi" matches "Hoa cưới". */
const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

const flattenCategories = (categories: Category[], depth = 0): CategoryOption[] =>
  categories.flatMap((category) => [{ category, depth }, ...flattenCategories(category.children ?? [], depth + 1)])

/** Keeps a category when it matches, or when any of its descendants does (so the parent stays as context). */
const filterCategories = (categories: Category[], query: string): Category[] =>
  categories.reduce<Category[]>((matches, category) => {
    if (normalizeText(category.name).includes(query)) {
      matches.push(category)
      return matches
    }

    const children = filterCategories(category.children ?? [], query)
    if (children.length > 0) matches.push({ ...category, children })

    return matches
  }, [])

interface ProductCategoriesEditorProps {
  product: Product
}

export default function ProductCategoriesEditor({ product }: ProductCategoriesEditorProps) {
  const { t } = useTenantTranslation()

  const [search, setSearch] = useState('')

  const { categories, isLoadingCategories } = useGetCategories({ pageSize: CATEGORY_PAGE_SIZE })

  const allOptions = useMemo(() => flattenCategories(categories.value.items), [categories.value.items])

  const options = useMemo(() => {
    const query = normalizeText(search.trim())
    if (!query) return allOptions

    return flattenCategories(filterCategories(categories.value.items, query))
  }, [allOptions, categories.value.items, search])

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    product.categories.forEach((category) => map.set(category.categoryId, category.name))
    allOptions.forEach(({ category }) => map.set(category.categoryId, category.name))
    return map
  }, [product.categories, allOptions])

  const { methods, updateProductCategories, isUpdatingProductCategories } = useUpdateProductCategories(product)

  const onSubmit = methods.handleSubmit((values) => updateProductCategories(values))

  return (
    <DetailSection
      title={t('products.detail.categories.title')}
      description={t('products.detail.categories.description')}
    >
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
    </DetailSection>
  )
}
