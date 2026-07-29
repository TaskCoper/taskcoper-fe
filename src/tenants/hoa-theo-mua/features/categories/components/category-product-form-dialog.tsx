import { DatePickerField } from '@/components/date-picker-field'
import MultiSelectField from '@/components/multi-select-field'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { FolderIcon, SaveIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, FormProvider, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import { CategoryProductPage, CategoryProductPageLabel, CategoryProductType } from '../types'
import type { CategoryProductFormValues } from '../validations'
import CategoryTreePicker, { type CategoryTreeLikeNode } from './category-tree-picker'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const

interface CategoryProductFormDialogProps {
  mode: 'create' | 'update'
  open: boolean
  methods: UseFormReturn<CategoryProductFormValues>
  parentCategories: CategoryTreeLikeNode[]
  /** On edit, the category being edited and all its descendants — a category can't parent itself or a descendant. */
  excludeParentIds?: Set<string>
  isSubmitting: boolean
  /** True while the category detail is being fetched for edit — renders a skeleton instead of stale/default field values. */
  isLoading?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: SubmitHandler<CategoryProductFormValues>
}

/** Mirrors the form's field layout so the skeleton doesn't jump around once real content swaps in. */
function CategoryProductFormSkeleton() {
  return (
    <div className='space-y-4'>
      <FieldGroup className='gap-3'>
        <div className='space-y-3'>
          <Skeleton className='h-9 w-full' />
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-9 w-full' />
          </div>
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-16 w-full' />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Skeleton className='h-4 w-28' />
          <div className='grid grid-cols-2 gap-2'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </div>

        <div className='space-y-1.5'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-9 w-full' />
        </div>

        <Skeleton className='h-16 w-full rounded-lg' />
        <Skeleton className='h-16 w-full rounded-lg' />
        <Skeleton className='h-16 w-full rounded-lg' />
      </FieldGroup>

      <DialogFooter>
        <Skeleton className='h-9 w-20' />
        <Skeleton className='h-9 w-32' />
      </DialogFooter>
    </div>
  )
}

export default function CategoryProductFormDialog({
  mode,
  open,
  methods,
  parentCategories,
  excludeParentIds,
  isSubmitting,
  isLoading = false,
  onOpenChange,
  onSubmit
}: CategoryProductFormDialogProps) {
  const { t } = useTenantTranslation()
  const isCreateMode = mode === 'create'
  const type = methods.watch('type')
  const isCampaign = type === CategoryProductType.Campaign
  // A category with a parent is a child (renders `isFilterable`); a top-level one is a parent
  // (renders the name/price filter toggles). §filter metadata.
  const isChild = !!methods.watch('parentId')

  const pageOptions = useMemo(
    () => Object.values(CategoryProductPage).map((page) => ({ value: page, label: t(CategoryProductPageLabel[page]) })),
    [t]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent position='top-center'>
        <DialogHeader>
          <DialogTitle>{t(`${CATEGORY_FORM_PREFIX}.${isCreateMode ? 'createTitle' : 'updateTitle'}`)}</DialogTitle>
          <DialogDescription>
            {t(`${CATEGORY_FORM_PREFIX}.${isCreateMode ? 'createDescription' : 'updateDescription'}`)}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <CategoryProductFormSkeleton />
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
              <FieldGroup className='gap-3'>
                <Tabs defaultValue='vi' className='gap-3'>
                  <TabsList className='w-full'>
                    <TabsTrigger value='vi'>{t(`${CATEGORY_FORM_PREFIX}.langVi`)}</TabsTrigger>
                    <TabsTrigger value='en'>{t(`${CATEGORY_FORM_PREFIX}.langEn`)}</TabsTrigger>
                  </TabsList>

                  <TabsContent value='vi' className='flex flex-col gap-3'>
                    <Controller
                      name='name'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className='gap-1'>
                          <FieldLabel htmlFor={field.name} className='gap-0.5'>
                            {t(`${CATEGORY_FORM_PREFIX}.nameLabel`)}
                            <span className='font-semibold text-destructive'>*</span>
                          </FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            placeholder={t(`${CATEGORY_FORM_PREFIX}.namePlaceholder`)}
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
                      name='description'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className='gap-1'>
                          <FieldLabel htmlFor={field.name} className='gap-0.5'>
                            {t(`${CATEGORY_FORM_PREFIX}.descriptionLabel`)}
                            <span className='font-semibold text-destructive'>*</span>
                          </FieldLabel>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            id={field.name}
                            placeholder={t(`${CATEGORY_FORM_PREFIX}.descriptionPlaceholder`)}
                            aria-invalid={fieldState.invalid}
                            rows={3}
                          />
                          <div className='min-h-4'>
                            {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                          </div>
                        </Field>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value='en' className='flex flex-col gap-3'>
                    <Controller
                      name='name_En'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className='gap-1'>
                          <FieldLabel htmlFor={field.name} className='gap-0.5'>
                            {t(`${CATEGORY_FORM_PREFIX}.nameEnLabel`)}
                            <span className='font-semibold text-destructive'>*</span>
                          </FieldLabel>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            id={field.name}
                            placeholder={t(`${CATEGORY_FORM_PREFIX}.nameEnPlaceholder`)}
                            aria-invalid={fieldState.invalid}
                          />
                          <div className='min-h-4'>
                            {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                          </div>
                        </Field>
                      )}
                    />

                    <Controller
                      name='description_En'
                      control={methods.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className='gap-1'>
                          <FieldLabel htmlFor={field.name} className='gap-0.5'>
                            {t(`${CATEGORY_FORM_PREFIX}.descriptionEnLabel`)}
                            <span className='font-semibold text-destructive'>*</span>
                          </FieldLabel>
                          <Textarea
                            {...field}
                            value={field.value ?? ''}
                            id={field.name}
                            placeholder={t(`${CATEGORY_FORM_PREFIX}.descriptionEnPlaceholder`)}
                            aria-invalid={fieldState.invalid}
                            rows={3}
                          />
                          <div className='min-h-4'>
                            {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                          </div>
                        </Field>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <Controller
                  name='type'
                  control={methods.control}
                  render={({ field }) => (
                    <Field className='gap-1'>
                      <FieldLabel>{t(`${CATEGORY_FORM_PREFIX}.typeLabel`)}</FieldLabel>
                      <div className='grid grid-cols-2 gap-2'>
                        {[CategoryProductType.Fix, CategoryProductType.Campaign].map((option) => {
                          const selected = field.value === option

                          return (
                            <button
                              key={option}
                              type='button'
                              onClick={() => field.onChange(option)}
                              aria-pressed={selected}
                              className={cn(
                                'cursor-pointer rounded-lg border px-3 py-2.5 text-left transition-colors',
                                selected
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'border-input hover:bg-accent'
                              )}
                            >
                              <span className='block text-sm font-medium'>
                                {t(
                                  `productCategories.type.${option === CategoryProductType.Campaign ? 'campaign' : 'fix'}`
                                )}
                              </span>
                              <span className='block text-xs text-muted-foreground'>
                                {t(`${CATEGORY_FORM_PREFIX}.type${option}Hint`)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </Field>
                  )}
                />

                {isCampaign && (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <DatePickerField
                      control={methods.control}
                      name='startTime'
                      label={`${CATEGORY_FORM_PREFIX}.startTimeLabel` as I18nKey}
                      isRequired
                    />
                    <DatePickerField
                      control={methods.control}
                      name='endTime'
                      label={`${CATEGORY_FORM_PREFIX}.endTimeLabel` as I18nKey}
                      isRequired
                    />
                  </div>
                )}

                <Controller
                  name='parentId'
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1'>
                      <FieldLabel htmlFor={field.name}>{t(`${CATEGORY_FORM_PREFIX}.parentLabel`)}</FieldLabel>
                      <CategoryTreePicker
                        categories={parentCategories}
                        excludeIds={excludeParentIds}
                        value={field.value ?? null}
                        onChange={(categoryId) => field.onChange(categoryId ?? undefined)}
                        t={t}
                        triggerId={field.name}
                        invalid={fieldState.invalid}
                        emptyLabel={t('productCategories.sort.empty')}
                        rootOption={{
                          icon: <FolderIcon className='size-4 shrink-0 text-muted-foreground' />,
                          label: t(`${CATEGORY_FORM_PREFIX}.noParent`)
                        }}
                      />
                      <div className='min-h-4'>
                        {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                      </div>
                    </Field>
                  )}
                />

                {!isChild && (
                  <MultiSelectField
                    name='page'
                    control={methods.control}
                    options={pageOptions}
                    label={`${CATEGORY_FORM_PREFIX}.pagesLabel` as I18nKey}
                    placeholder={`${CATEGORY_FORM_PREFIX}.pagesPlaceholder` as I18nKey}
                    searchPlaceholder={`${CATEGORY_FORM_PREFIX}.pagesSearchPlaceholder` as I18nKey}
                    emptyMessage={`${CATEGORY_FORM_PREFIX}.pagesEmpty` as I18nKey}
                    modal
                  />
                )}

                {isChild ? (
                  <Controller
                    name='metaData.isFilterable'
                    control={methods.control}
                    render={({ field }) => (
                      <Field orientation='horizontal' className='items-center justify-between rounded-lg border p-3'>
                        <div className='space-y-0.5'>
                          <FieldLabel htmlFor={field.name}>{t(`${CATEGORY_FORM_PREFIX}.isFilterableLabel`)}</FieldLabel>
                          <p className='text-xs text-muted-foreground'>
                            {t(`${CATEGORY_FORM_PREFIX}.isFilterableHint`)}
                          </p>
                        </div>
                        <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                      </Field>
                    )}
                  />
                ) : (
                  <>
                    <Controller
                      name='metaData.filterByName'
                      control={methods.control}
                      render={({ field }) => (
                        <Field orientation='horizontal' className='items-center justify-between rounded-lg border p-3'>
                          <div className='space-y-0.5'>
                            <FieldLabel htmlFor={field.name}>
                              {t(`${CATEGORY_FORM_PREFIX}.filterByNameLabel`)}
                            </FieldLabel>
                            <p className='text-xs text-muted-foreground'>
                              {t(`${CATEGORY_FORM_PREFIX}.filterByNameHint`)}
                            </p>
                          </div>
                          <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                        </Field>
                      )}
                    />

                    <Controller
                      name='metaData.filterByPrice'
                      control={methods.control}
                      render={({ field }) => (
                        <Field orientation='horizontal' className='items-center justify-between rounded-lg border p-3'>
                          <div className='space-y-0.5'>
                            <FieldLabel htmlFor={field.name}>
                              {t(`${CATEGORY_FORM_PREFIX}.filterByPriceLabel`)}
                            </FieldLabel>
                            <p className='text-xs text-muted-foreground'>
                              {t(`${CATEGORY_FORM_PREFIX}.filterByPriceHint`)}
                            </p>
                          </div>
                          <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                        </Field>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-3'>
                      <Controller
                        name='metaData.rows'
                        control={methods.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className='gap-1'>
                            <FieldLabel htmlFor={field.name}>{t(`${CATEGORY_FORM_PREFIX}.rowsLabel`)}</FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              inputMode='numeric'
                              value={field.value ?? ''}
                              aria-invalid={fieldState.invalid}
                              onBlur={(e) => {
                                field.onBlur()
                                const val = e.target.value
                                field.onChange(val === '' ? undefined : Number(val))
                              }}
                            />
                            <div className='min-h-4'>
                              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                            </div>
                          </Field>
                        )}
                      />

                      <Controller
                        name='metaData.cols'
                        control={methods.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className='gap-1'>
                            <FieldLabel htmlFor={field.name}>{t(`${CATEGORY_FORM_PREFIX}.colsLabel`)}</FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              inputMode='numeric'
                              value={field.value ?? ''}
                              aria-invalid={fieldState.invalid}
                              onBlur={(e) => {
                                field.onBlur()
                                const val = e.target.value
                                field.onChange(val === '' ? undefined : Number(val))
                              }}
                            />
                            <div className='min-h-4'>
                              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                            </div>
                          </Field>
                        )}
                      />
                    </div>
                  </>
                )}

                <Controller
                  name='isActive'
                  control={methods.control}
                  render={({ field }) => (
                    <Field orientation='horizontal' className='items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FieldLabel htmlFor={field.name}>{t(`${CATEGORY_FORM_PREFIX}.activeLabel`)}</FieldLabel>
                        <p className='text-xs text-muted-foreground'>{t(`${CATEGORY_FORM_PREFIX}.activeHint`)}</p>
                      </div>
                      <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
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
                  {t(`${CATEGORY_FORM_PREFIX}.${isCreateMode ? 'createSubmit' : 'updateSubmit'}`)}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
