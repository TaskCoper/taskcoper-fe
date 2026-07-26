import { DatePickerField } from '@/components/date-picker-field'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { SaveIcon } from 'lucide-react'
import { Controller, FormProvider, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import { CategoryProductType } from '../types'
import type { CategoryProductFormValues } from '../validations'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const
const NONE_PARENT_VALUE = '__none__'

/** A parent-picker option, flattened from the tree with `depth` for indentation. */
export interface ParentOption {
  categoryId: string
  name: string
  depth: number
}

interface CategoryProductFormDialogProps {
  mode: 'create' | 'update'
  open: boolean
  methods: UseFormReturn<CategoryProductFormValues>
  parentOptions: ParentOption[]
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

export function CategoryProductFormDialog({
  mode,
  open,
  methods,
  parentOptions,
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
                                'rounded-lg border px-3 py-2.5 text-left transition-colors',
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
                      <Select
                        value={field.value ?? NONE_PARENT_VALUE}
                        onValueChange={(value) => field.onChange(value === NONE_PARENT_VALUE ? undefined : value)}
                      >
                        <SelectTrigger id={field.name} className='w-full' aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder={t(`${CATEGORY_FORM_PREFIX}.parentPlaceholder`)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value={NONE_PARENT_VALUE}>{t(`${CATEGORY_FORM_PREFIX}.noParent`)}</SelectItem>
                            {parentOptions.map((option) => (
                              <SelectItem key={option.categoryId} value={option.categoryId}>
                                <span style={{ paddingLeft: `${option.depth * 12}px` }}>{option.name}</span>
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
