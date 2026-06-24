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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { Row } from '@tanstack/react-table'
import { CirclePlus, MoreHorizontalIcon, SaveIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import { getColumns } from '../features/category-news/components/article-category-column'
import { useAddCategory } from '../features/category-news/hooks/use-add-category'
import { useDeleteCategory } from '../features/category-news/hooks/use-delete-category'
import { useGetCategories } from '../features/category-news/hooks/use-get-categories'
import { useUpdateCategory } from '../features/category-news/hooks/use-update-category'
import type { NewsCategoryRow } from '../features/category-news/types'
import type { AddCategoryFormValues } from '../features/category-news/validations'

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
  const parentOptions = categories.filter(
    (category) => category.categoryId !== excludedCategoryId && category.parentId == null
  )
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

interface CategoryChildrenTableProps {
  row: Row<NewsCategoryRow>
  isUpdatingCategory?: boolean
  isDeletingCategory?: boolean
  onUpdateCategory: (category: NewsCategoryRow) => void
  onDeleteCategory: (id: string) => void
}

function CategoryChildrenTable({
  row,
  isUpdatingCategory,
  isDeletingCategory,
  onUpdateCategory,
  onDeleteCategory
}: CategoryChildrenTableProps) {
  const { t } = useTenantTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [columnWidths, setColumnWidths] = useState<number[]>([])
  const children = row.original.children ?? []
  const visibleCells = row.getVisibleCells()
  const columnCount = visibleCells.length

  useLayoutEffect(() => {
    const subComponentRow = containerRef.current?.closest('tr')
    const parentRow = subComponentRow?.previousElementSibling

    if (!(parentRow instanceof HTMLTableRowElement)) return

    const syncColumnWidths = () => {
      const widths = Array.from(parentRow.cells)
        .slice(0, columnCount)
        .map((cell) => cell.getBoundingClientRect().width)

      if (widths.length !== columnCount) return

      setColumnWidths((currentWidths) => {
        const hasChanged =
          currentWidths.length !== widths.length ||
          widths.some((width, index) => Math.round(width) !== Math.round(currentWidths[index] ?? 0))

        return hasChanged ? widths : currentWidths
      })
    }

    syncColumnWidths()

    const resizeObserver = new ResizeObserver(syncColumnWidths)
    resizeObserver.observe(parentRow)
    Array.from(parentRow.cells).forEach((cell) => resizeObserver.observe(cell))
    window.addEventListener('resize', syncColumnWidths)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncColumnWidths)
    }
  }, [columnCount])

  return (
    <div
      ref={containerRef}
      className="
    py-0
    bg-background
    relative
    before:absolute
    before:left-0
    before:top-0
    before:h-full
    before:w-1
    before:bg-primary
    before:content-['']
  "
    >
      <div className='overflow-hidden'>
        <Table className='table-fixed'>
          <colgroup>
            {visibleCells.map((cell, index) => (
              <col key={cell.id} style={{ width: columnWidths[index] ?? cell.column.getSize() }} />
            ))}
          </colgroup>
          <TableBody>
            {children.length ? (
              children.map((child) => {
                const title = child.title?.trim()

                return (
                  <TableRow
                    key={child.categoryId}
                    className='border-primary-200/60 bg-primary-50/70 hover:bg-primary-100/80'
                  >
                    {visibleCells.map((cell) => {
                      const columnId = cell.column.id

                      if (columnId === 'title') {
                        return (
                          <TableCell
                            key={`${child.categoryId}-${columnId}`}
                            className='bg-transparent py-2 font-medium'
                          >
                            {title || t('articleCategories.column.noTitle')}
                          </TableCell>
                        )
                      }

                      if (columnId === 'count') {
                        return (
                          <TableCell
                            key={`${child.categoryId}-${columnId}`}
                            className='bg-transparent py-2 text-center text-sm tabular-nums text-muted-foreground'
                          >
                            {child.count ?? 0}
                          </TableCell>
                        )
                      }

                      if (columnId === 'actions') {
                        return (
                          <TableCell key={`${child.categoryId}-${columnId}`} className='bg-transparent py-2'>
                            <div className='flex justify-end pr-2'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' className='size-8 rounded-lg p-0'>
                                    <span className='sr-only'>{t('articleCategories.action.openMenu')}</span>
                                    <MoreHorizontalIcon className='size-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuLabel>{t('articleCategories.action.actions')}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    disabled={isUpdatingCategory}
                                    onClick={() => onUpdateCategory(child)}
                                  >
                                    {t('articleCategories.action.update')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className='focus:text-destructive'
                                    disabled={isDeletingCategory}
                                    onClick={() => onDeleteCategory(child.categoryId)}
                                  >
                                    {t('articleCategories.action.delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        )
                      }

                      return <TableCell key={`${child.categoryId}-${columnId}`} className='bg-transparent py-2' />
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={visibleCells.length} className='h-16 text-center text-muted-foreground'>
                  {t('articleCategories.column.noChildren')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
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

  const handleOpenUpdateCategory = useCallback(
    (category: NewsCategoryRow) => {
      setEditingCategory(category)
      updateMethods.reset({
        title: category.title ?? '',
        parentId: category.parentId ?? undefined
      })
    },
    [updateMethods]
  )

  const handleDeleteCategory = useCallback(
    async (id: string) => {
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
    [confirm, deleteCategory, t]
  )

  const columns = useMemo(
    () =>
      getColumns({
        t,
        onUpdateCategory: handleOpenUpdateCategory,
        onDeleteCategory: handleDeleteCategory,
        isUpdatingCategory,
        isDeletingCategory
      }),
    [handleDeleteCategory, handleOpenUpdateCategory, isDeletingCategory, isUpdatingCategory, t]
  )

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'articleCategories'
  })

  const [titleFilter] = useQueryState('articleCategories_title', parseAsString)
  const title = titleFilter ?? undefined

  const { categories, isLoadingCategories } = useGetCategories({
    pageIndex: page,
    pageSize: limit,
    keyword: title
  })

  const categoryRows = categories.value.items
  const categoryItems = useMemo(() => flattenCategoryRows(categories.value.items), [categories.value.items])

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
    <div className='space-y-6 p-6'>
      <div>
        <p className='text-2xl font-bold'>{t('articleCategories.page.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('articleCategories.page.description')}</p>
      </div>

      <DataTable
        table={table}
        isLoading={isLoadingCategories}
        renderSubComponent={({ row }) => (
          <CategoryChildrenTable
            row={row}
            isUpdatingCategory={isUpdatingCategory}
            isDeletingCategory={isDeletingCategory}
            onUpdateCategory={handleOpenUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      >
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
