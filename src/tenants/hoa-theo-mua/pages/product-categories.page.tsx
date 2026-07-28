import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { CirclePlus } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type SubmitHandler } from 'react-hook-form'
import AssignProductsDialog from '../features/categories/components/assign-products-dialog'
import { getCategoryColumns } from '../features/categories/components/category-product-columns'
import CategoryProductFormDialog from '../features/categories/components/category-product-form-dialog'
import { useAddCategory } from '../features/categories/hooks/use-add-category'
import { useDeleteCategory } from '../features/categories/hooks/use-delete-category'
import { useGetCategories } from '../features/categories/hooks/use-get-categories'
import { useGetCategory } from '../features/categories/hooks/use-get-category'
import { useUpdateCategory } from '../features/categories/hooks/use-update-category'
import type { Category, CategoryMetadata } from '../features/categories/types'
import type { CategoryProductFormValues } from '../features/categories/validations'

const CATEGORY_PREFIX = 'productCategories' as const

/** `metaData` comes back as a JSON-encoded string (or null) — parse it defensively. */
const parseCategoryMetadata = (metaData: string | null): CategoryMetadata => {
  if (!metaData) return {}
  try {
    return JSON.parse(metaData) as CategoryMetadata
  } catch {
    return {}
  }
}

/** All descendant ids of a category (any depth) — used to exclude invalid parents and warn on delete. */
const collectDescendantIds = (category: Category): string[] => {
  const ids: string[] = []
  const visit = (node: Category) => {
    node.children?.forEach((child) => {
      ids.push(child.categoryId)
      visit(child)
    })
  }
  visit(category)
  return ids
}

/** Ascending by `position`; unset positions sink to the end while preserving server order (stable sort). */
const byPositionAsc = (a: Category, b: Category) =>
  (a.position ?? Number.POSITIVE_INFINITY) - (b.position ?? Number.POSITIVE_INFINITY)

/** Sort every level of the category tree ascending by position, client-side. */
const sortCategoryTree = (categories: Category[]): Category[] =>
  [...categories]
    .sort(byPositionAsc)
    .map((category) =>
      category.children?.length ? { ...category, children: sortCategoryTree(category.children) } : category
    )

export default function ProductCategoriesPage() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [managingCategory, setManagingCategory] = useState<Category | null>(null)
  const isUpdateDialogOpen = !!editingCategory

  const { methods: addMethods, addCategory, isAddingCategory } = useAddCategory()
  const { methods: updateMethods, updateCategory, isUpdatingCategory } = useUpdateCategory(editingCategory?.categoryId)
  const { deleteCategory, isDeletingCategory } = useDeleteCategory()
  const { category: editingCategoryDetail, isLoadingCategory } = useGetCategory(editingCategory?.categoryId)

  const handleOpenUpdateCategory = useCallback((category: Category) => {
    setEditingCategory(category)
  }, [])

  useEffect(() => {
    if (!editingCategoryDetail) return

    const metadata = parseCategoryMetadata(editingCategoryDetail.metaData)

    updateMethods.reset({
      name: editingCategoryDetail.name ?? '',
      name_En: editingCategoryDetail.name_En ?? '',
      description: editingCategoryDetail.description ?? '',
      description_En: editingCategoryDetail.description_En ?? '',
      type: editingCategoryDetail.type,
      isActive: editingCategoryDetail.isActive,
      startTime: editingCategoryDetail.startTime,
      endTime: editingCategoryDetail.endTime,
      parentId: editingCategoryDetail.parentId ?? undefined,
      position: editingCategoryDetail.position ?? null,
      metaData: {
        filterByName: metadata.filterByName ?? false,
        filterByPrice: metadata.filterByPrice ?? false,
        isFilterable: metadata.isFilterable ?? false
      },
      page: editingCategoryDetail.page ?? []
    })
  }, [editingCategoryDetail, updateMethods])

  const handleManageProducts = useCallback((category: Category) => {
    setManagingCategory(category)
  }, [])

  const handleDeleteCategory = useCallback(
    async (category: Category) => {
      const descendantCount = collectDescendantIds(category).length

      const confirmed = await confirm({
        title: t(`${CATEGORY_PREFIX}.confirm.deleteTitle`),
        description:
          descendantCount > 0
            ? t(`${CATEGORY_PREFIX}.confirm.deleteDescriptionWithChildren`, { count: descendantCount })
            : t(`${CATEGORY_PREFIX}.confirm.deleteDescription`),
        confirmText: t('common.button.delete'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (!confirmed) return

      deleteCategory({ id: category.categoryId })
    },
    [confirm, deleteCategory, t]
  )

  const columns = useMemo(
    () =>
      getCategoryColumns({
        t,
        onManageProducts: handleManageProducts,
        onUpdateCategory: handleOpenUpdateCategory,
        onDeleteCategory: handleDeleteCategory,
        isUpdatingCategory,
        isDeletingCategory
      }),
    [handleDeleteCategory, handleManageProducts, handleOpenUpdateCategory, isDeletingCategory, isUpdatingCategory, t]
  )

  const { page, limit, sorting } = useTableQueryParams({ columns, prefix: CATEGORY_PREFIX })

  const [nameFilter] = useQueryState(`${CATEGORY_PREFIX}_name`, parseAsString)
  const keyword = nameFilter ?? undefined

  const { categories, isLoadingCategories } = useGetCategories({
    pageIndex: page,
    pageSize: limit,
    keyword
  })

  // Sort ascending by position on the client so reordered children settle into their new slot (§reorder).
  const categoryRows = useMemo(() => sortCategoryTree(categories.value.items), [categories.value.items])

  // On edit, a category cannot parent itself or any of its descendants (§4.4).
  const editExcludeParentIds = useMemo(() => {
    if (!editingCategory) return undefined
    return new Set([editingCategory.categoryId, ...collectDescendantIds(editingCategory)])
  }, [editingCategory])

  const { table } = useDataTable({
    data: categoryRows,
    columns,
    pageCount: Math.ceil(categories.value.totalCount / limit) || 1,
    // Nest the tree natively so it expands to any depth (§4.1).
    getSubRows: (row) => row.children ?? undefined,
    getRowCanExpand: (row) => !!row.original.children?.length,
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<Category>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ categoryId }) => categoryId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: `${CATEGORY_PREFIX}_page`,
      perPage: `${CATEGORY_PREFIX}_perPage`,
      sort: `${CATEGORY_PREFIX}_sort`
    },
    filterPrefix: CATEGORY_PREFIX
  })

  const handleAddDialogOpenChange = useCallback(
    (open: boolean) => {
      setIsAddDialogOpen(open)
      if (!open) addMethods.reset()
    },
    [addMethods]
  )

  const handleUpdateDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setEditingCategory(null)
        updateMethods.reset()
      }
    },
    [updateMethods]
  )

  const handleAssignDialogOpenChange = useCallback((open: boolean) => {
    if (!open) setManagingCategory(null)
  }, [])

  const handleCreateCategory: SubmitHandler<CategoryProductFormValues> = useCallback(
    (body) => {
      addCategory({ body }, { onSuccess: () => setIsAddDialogOpen(false) })
    },
    [addCategory]
  )

  const handleUpdateCategory: SubmitHandler<CategoryProductFormValues> = useCallback(
    (body) => {
      updateCategory({ body }, { onSuccess: () => setEditingCategory(null) })
    },
    [updateCategory]
  )

  return (
    <div className='space-y-6 p-6'>
      <div>
        <p className='text-2xl font-bold'>{t(`${CATEGORY_PREFIX}.page.title`)}</p>
        <p className='text-sm text-muted-foreground'>{t(`${CATEGORY_PREFIX}.page.description`)}</p>
      </div>

      <DataTable table={table} isLoading={isLoadingCategories}>
        <DataTableToolbar table={table}>
          <Button size='sm' onClick={() => setIsAddDialogOpen(true)}>
            <CirclePlus className='size-3' />
            {t(`${CATEGORY_PREFIX}.form.createTitle`)}
          </Button>
        </DataTableToolbar>
      </DataTable>

      <CategoryProductFormDialog
        mode='create'
        open={isAddDialogOpen}
        methods={addMethods}
        parentCategories={categoryRows}
        isSubmitting={isAddingCategory}
        onOpenChange={handleAddDialogOpenChange}
        onSubmit={handleCreateCategory}
      />

      <CategoryProductFormDialog
        mode='update'
        open={isUpdateDialogOpen}
        methods={updateMethods}
        parentCategories={categoryRows}
        excludeParentIds={editExcludeParentIds}
        isSubmitting={isUpdatingCategory}
        isLoading={isLoadingCategory}
        onOpenChange={handleUpdateDialogOpenChange}
        onSubmit={handleUpdateCategory}
      />

      <AssignProductsDialog
        open={!!managingCategory}
        category={managingCategory}
        onOpenChange={handleAssignDialogOpenChange}
      />
    </div>
  )
}
