import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { CategoryTreeLikeNode } from '../../categories/components/category-tree-picker'

const PRODUCT_CATEGORY_LABEL_KEYS: Record<string, string> = {
  'a866c3e5-bd00-4e34-9e3f-36656a01a416': 'products.categoryNames.villa',
  'e7a809c9-5651-4057-90d0-73001c700478': 'products.categoryNames.thatchedHouse'
}

export const getProductCategoryLabel = (category: Pick<CategoryTreeLikeNode, 'categoryId' | 'name'>, t: TenantT) => {
  const translationKey = PRODUCT_CATEGORY_LABEL_KEYS[category.categoryId]
  return translationKey ? t(translationKey) : category.name?.trim() || t('productCategories.column.noName')
}

export const localizeProductCategories = (categories: CategoryTreeLikeNode[], t: TenantT): CategoryTreeLikeNode[] =>
  categories.map((category) => ({
    ...category,
    name: getProductCategoryLabel(category, t),
    children: category.children?.length ? localizeProductCategories(category.children, t) : category.children
  }))
