import { Badge } from '@/components/ui/badge'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import RevenueLabelPopover from '@/features/labels/components/label-revenue'
import { useGetRevenueLabels } from '@/features/projects/hooks/use-get-revenue-labels'
import { cn, getColorTextClass } from '@/shared/utils'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, TagIcon } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CreateRevenueFormValues } from '../../validations'

export default function CreateRevenueForm({ projectId }: { projectId: string }) {
  const { t } = useTranslation()
  const { control } = useFormContext<CreateRevenueFormValues>()
  const { revenueLabels } = useGetRevenueLabels({ projectId })

  return (
    <div className='flex flex-col gap-4 w-full'>
      {/* Name */}
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('project.projectRevenue.form.name')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('project.projectRevenue.form.namePlaceholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      {/* Type + Amount */}
      <div className='grid grid-cols-2 gap-3'>
        <Controller
          name='type'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('project.projectRevenue.form.type')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='income'>
                    <span className='flex items-center gap-1.5 text-emerald-600'>
                      <ArrowUpCircleIcon className='size-3.5' />
                      {t('project.projectRevenue.type.income')}
                    </span>
                  </SelectItem>
                  <SelectItem value='expense'>
                    <span className='flex items-center gap-1.5 text-rose-500'>
                      <ArrowDownCircleIcon className='size-3.5' />
                      {t('project.projectRevenue.type.expense')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='amount'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('project.projectRevenue.form.amount')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='number'
                placeholder='0'
                min={0}
                aria-invalid={fieldState.invalid}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      {/* Note */}
      <Controller
        name='note'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('project.projectRevenue.form.note')}</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder={t('project.projectRevenue.form.notePlaceholder')}
              rows={3}
              className='resize-none'
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />

      {/* Labels */}
      <Controller
        name='labelIds'
        control={control}
        render={({ field }) => {
          const selectedIds: string[] = field.value ?? []
          const selectedLabels = selectedIds
            .map((id) => revenueLabels?.value?.items?.find((l) => l.id === id))
            .filter(Boolean)

          return (
            <Field className='gap-1.5'>
              <FieldLabel>{t('task.label.label')}</FieldLabel>
              <div className='flex items-center gap-2'>
                {/* Trigger button nhỏ gọn */}
                <RevenueLabelPopover
                  projectId={projectId}
                  selectedIds={selectedIds}
                  onSelect={(id) => {
                    if (selectedIds.includes(id)) {
                      field.onChange(selectedIds.filter((sid) => sid !== id))
                    } else {
                      field.onChange([...selectedIds, id])
                    }
                  }}
                  onSelectAll={(ids) => field.onChange(ids)}
                >
                  <button
                    type='button'
                    className={cn(
                      'h-8 w-8 rounded-md border border-input bg-background flex items-center justify-center',
                      'hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                  >
                    <TagIcon className='size-4' />
                  </button>
                </RevenueLabelPopover>
                {/* Các label đã chọn nằm kế bên */}
                <div className='flex flex-wrap gap-1'>
                  {selectedLabels.map((label) =>
                    label ? (
                      <Badge
                        key={label.id}
                        variant='secondary'
                        className={cn(
                          label.color || 'bg-gray-200',
                          'flex items-center gap-1 px-1.5 h-5 text-xs font-semibold rounded-sm border-0',
                          getColorTextClass(label.color ?? '')
                        )}
                      >
                        {label.name}
                      </Badge>
                    ) : null
                  )}
                </div>
              </div>
            </Field>
          )
        }}
      />
    </div>
  )
}
