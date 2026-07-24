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
import { useCallback, useMemo, useState } from 'react'
import { type SubmitHandler } from 'react-hook-form'
import { AssignProductsDialog } from '../features/products/components/assign-products-dialog'
import { getCategoryColumns } from '../features/products/components/category-product-columns'
import {
  CategoryProductFormDialog,
  type ParentOption
} from '../features/products/components/category-product-form-dialog'
import { useAddCategory } from '../features/products/hooks/use-add-category'
import { useDeleteCategory } from '../features/products/hooks/use-delete-category'
import { useGetCategories } from '../features/products/hooks/use-get-categories'
import { useUpdateCategory } from '../features/products/hooks/use-update-category'
import type { CategoryProduct } from '../features/products/types'
import type { CategoryProductFormValues } from '../features/products/validations'

const CATEGORY_PREFIX = 'productCategories' as const

/** All descendant ids of a category (any depth) — used to exclude invalid parents and warn on delete. */
const collectDescendantIds = (category: CategoryProduct): string[] => {
  const ids: string[] = []
  const visit = (node: CategoryProduct) => {
    node.children?.forEach((child) => {
      ids.push(child.categoryId)
      visit(child)
    })
  }
  visit(category)
  return ids
}

/** Flatten the tree into depth-tagged options for the parent picker. */
const flattenWithDepth = (categories: CategoryProduct[], depth = 0): ParentOption[] =>
  categories.flatMap((category) => [
    { categoryId: category.categoryId, name: category.name, depth },
    ...flattenWithDepth(category.children ?? [], depth + 1)
  ])

export default function ProductCategoriesPage() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryProduct | null>(null)
  const [managingCategory, setManagingCategory] = useState<CategoryProduct | null>(null)
  const isUpdateDialogOpen = !!editingCategory

  const { methods: addMethods, addCategory, isAddingCategory } = useAddCategory()
  const { methods: updateMethods, updateCategory, isUpdatingCategory } = useUpdateCategory(editingCategory?.categoryId)
  const { deleteCategory, isDeletingCategory } = useDeleteCategory()

  const handleOpenUpdateCategory = useCallback(
    (category: CategoryProduct) => {
      setEditingCategory(category)
      updateMethods.reset({
        name: category.name ?? '',
        type: category.type,
        isActive: category.isActive,
        startTime: category.startTime,
        endTime: category.endTime,
        parentId: category.parentId ?? undefined
      })
    },
    [updateMethods]
  )

  const handleManageProducts = useCallback((category: CategoryProduct) => {
    setManagingCategory(category)
  }, [])

  const handleDeleteCategory = useCallback(
    async (category: CategoryProduct) => {
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

  const categoryRows = categories.value.items
  const parentOptions = useMemo(() => flattenWithDepth(categories.value.items), [categories.value.items])

  // On edit, a category cannot parent itself or any of its descendants (§4.4).
  const editParentOptions = useMemo(() => {
    if (!editingCategory) return parentOptions

    const excluded = new Set([editingCategory.categoryId, ...collectDescendantIds(editingCategory)])
    return parentOptions.filter((option) => !excluded.has(option.categoryId))
  }, [editingCategory, parentOptions])

  const { table } = useDataTable({
    data: categoryRows,
    columns,
    pageCount: Math.ceil(categories.value.totalCount / limit) || 1,
    // Nest the tree natively so it expands to any depth (§4.1).
    getSubRows: (row) => row.children ?? undefined,
    getRowCanExpand: (row) => !!row.original.children?.length,
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<CategoryProduct>[],
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
        parentOptions={parentOptions}
        isSubmitting={isAddingCategory}
        onOpenChange={handleAddDialogOpenChange}
        onSubmit={handleCreateCategory}
      />

      <CategoryProductFormDialog
        mode='update'
        open={isUpdateDialogOpen}
        methods={updateMethods}
        parentOptions={editParentOptions}
        isSubmitting={isUpdatingCategory}
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
