import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ChildMilestone } from '@/features/projects/milestones/types'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { AddTaskFormValues } from '../validations'

interface AddTaskWithMilestoneFormProps {
  milestones: ChildMilestone[]
  isLoading: boolean
}

export default function AddTaskWithMilestoneForm({ milestones, isLoading }: AddTaskWithMilestoneFormProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<AddTaskFormValues>()

  return (
    <div className='flex flex-col gap-4 w-full'>
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('common.field.title')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('task.addTask.field.name.placeholder')}
              autoComplete='off'
              spellCheck={false}
              autoFocus={true}
            />
            {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name='milestoneId'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('task.column.list')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              disabled={isLoading || milestones.length === 0}
            >
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent className='min-w-(--radix-select-trigger-width)'>
                {milestones.map((milestone) => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />
    </div>
  )
}
