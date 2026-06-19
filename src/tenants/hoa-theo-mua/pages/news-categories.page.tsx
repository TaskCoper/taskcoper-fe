import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { CirclePlus, SaveIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import { getColumns } from '../features/category-news/components/article-category-column'
import { useAddCategory } from '../features/category-news/hooks/use-add-category'
import { useDeleteCategory } from '../features/category-news/hooks/use-delete-category'
import { useGetCategories } from '../features/category-news/hooks/use-get-categories'
import { useUpdateCategory } from '../features/category-news/hooks/use-update-category'
import type { NewsCategoryRow } from '../features/category-news/type'
import type { AddCategoryFormValues } from '../features/category-news/validation'

const ARTICLE_CATEGORY_FORM_PREFIX = 'articleCategories.form' as const
const NONE_PARENT_VALUE = '__none__'

const flattenCategoryRows = (categories: NewsCategoryRow[]) => {
  const rows: NewsCategoryRow[] = []
  const seenCategoryIds = new Set<string>()

  const visitCategory = (category: NewsCategoryRow) => {
    if (seenCategoryIds.has(category.categoryId)) return

    seenCategoryIds.add(category.categoryId)
    rows.push(category)
    category.children?.forEach(visitCategory)
  }

  categories.forEach(visitCategory)

  return rows
}

interface CategoryFormDialogProps {
  mode: 'create' | 'update'
  open: boolean
  methods: UseFormReturn<AddCategoryFormValues>
  categories: NewsCategoryRow[]
  excludedCategoryId?: string
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: SubmitHandler<AddCategoryFormValues>
}

function CategoryFormDialog({
  mode,
  open,
  methods,
  categories,
  excludedCategoryId,
  isSubmitting,
  onOpenChange,
  onSubmit
}: CategoryFormDialogProps) {
  const { t } = useTenantTranslation()
  const parentOptions = categories.filter((category) => category.categoryId !== excludedCategoryId)
  const isCreateMode = mode === 'create'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(`${ARTICLE_CATEGORY_FORM_PREFIX}.${isCreateMode ? 'createTitle' : 'updateTitle'}`)}
          </DialogTitle>
          <DialogDescription>
            {t(`${ARTICLE_CATEGORY_FORM_PREFIX}.${isCreateMode ? 'createDescription' : 'updateDescription'}`)}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <FieldGroup className='gap-3'>
              <Controller
                name='title'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='gap-0.5'>
                      {t(`${ARTICLE_CATEGORY_FORM_PREFIX}.titleLabel`)}
                      <span className='font-semibold text-destructive'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={t(`${ARTICLE_CATEGORY_FORM_PREFIX}.titlePlaceholder`)}
                      aria-invalid={fieldState.invalid}
                      autoFocus
                    />
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name='parentId'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t(`${ARTICLE_CATEGORY_FORM_PREFIX}.parentLabel`)}</FieldLabel>
                    <Select
                      value={field.value ?? NONE_PARENT_VALUE}
                      onValueChange={(value) => field.onChange(value === NONE_PARENT_VALUE ? undefined : value)}
                    >
                      <SelectTrigger id={field.name} className='w-full' aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t(`${ARTICLE_CATEGORY_FORM_PREFIX}.parentPlaceholder`)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={NONE_PARENT_VALUE}>
                            {t(`${ARTICLE_CATEGORY_FORM_PREFIX}.noParent`)}
                          </SelectItem>
                          {parentOptions.map((category) => (
                            <SelectItem key={category.categoryId} value={category.categoryId}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <Button type='button' variant='outline' disabled={isSubmitting} onClick={() => onOpenChange(false)}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
                {t(`${ARTICLE_CATEGORY_FORM_PREFIX}.${isCreateMode ? 'createSubmit' : 'updateSubmit'}`)}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default function NewsCategoriesPage() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<NewsCategoryRow | null>(null)
  const isUpdateDialogOpen = !!editingCategory

  const { methods: addMethods, addCategory, isAddingCategory } = useAddCategory()
  const { methods: updateMethods, updateCategory, isUpdatingCategory } = useUpdateCategory(editingCategory?.categoryId)
  const { deleteCategory, isDeletingCategory } = useDeleteCategory()

  const columns = useMemo(
    () =>
      getColumns({
        t,
        onUpdateCategory: (category) => {
          setEditingCategory(category)
          updateMethods.reset({
            title: category.title ?? '',
            parentId: category.parentId ?? undefined
          })
        },
        onDeleteCategory: async (id) => {
          const confirmed = await confirm({
            title: t('articleCategories.confirm.deleteTitle'),
            description: t('articleCategories.confirm.deleteDescription'),
            confirmText: t('common.button.delete'),
            cancelText: t('common.button.cancel'),
            variant: 'destructive'
          })
          if (!confirmed) return

          deleteCategory({ id })
        },
        isUpdatingCategory,
        isDeletingCategory
      }),
    [confirm, deleteCategory, isDeletingCategory, isUpdatingCategory, t, updateMethods]
  )

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'articleCategories'
  })

  const { categories, isLoadingCategories } = useGetCategories({
    pageIndex: page,
    pageSize: limit
  })

  const categoryRows = useMemo(() => flattenCategoryRows(categories.value.items), [categories.value.items])

  const { table } = useDataTable({
    data: categoryRows,
    columns,
    pageCount: Math.ceil(categories.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<NewsCategoryRow>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ categoryId }) => categoryId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'articleCategories_page',
      perPage: 'articleCategories_perPage',
      sort: 'articleCategories_sort'
    },
    filterPrefix: 'articleCategories'
  })

  const categoryItems = categoryRows

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

  const handleCreateCategory: SubmitHandler<AddCategoryFormValues> = useCallback(
    (body) => {
      addCategory(
        { body },
        {
          onSuccess: () => {
            setIsAddDialogOpen(false)
          }
        }
      )
    },
    [addCategory]
  )

  const handleUpdateCategory: SubmitHandler<AddCategoryFormValues> = useCallback(
    (body) => {
      updateCategory(
        { body },
        {
          onSuccess: () => {
            setEditingCategory(null)
          }
        }
      )
    },
    [updateCategory]
  )

  return (
    <div className='space-y-4 p-4 max-w-7xl mx-auto'>
      <DataTable table={table} isLoading={isLoadingCategories} className='p-4'>
        <div className='space-y-1'>
          <h1 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
            {t('articleCategories.page.title')}
          </h1>
          <h2 className='max-w-2xl text-sm leading-6 text-muted-foreground'>
            {t('articleCategories.page.description')}
          </h2>
        </div>
        <DataTableToolbar table={table}>
          <Button size='sm' onClick={() => setIsAddDialogOpen(true)}>
            <CirclePlus className='size-3' />
            {t(`${ARTICLE_CATEGORY_FORM_PREFIX}.createTitle`)}
          </Button>
        </DataTableToolbar>
      </DataTable>

      <CategoryFormDialog
        mode='create'
        open={isAddDialogOpen}
        methods={addMethods}
        categories={categoryItems}
        isSubmitting={isAddingCategory}
        onOpenChange={handleAddDialogOpenChange}
        onSubmit={handleCreateCategory}
      />

      <CategoryFormDialog
        mode='update'
        open={isUpdateDialogOpen}
        methods={updateMethods}
        categories={categoryItems}
        excludedCategoryId={editingCategory?.categoryId}
        isSubmitting={isUpdatingCategory}
        onOpenChange={handleUpdateDialogOpenChange}
        onSubmit={handleUpdateCategory}
      />
    </div>
  )
}
