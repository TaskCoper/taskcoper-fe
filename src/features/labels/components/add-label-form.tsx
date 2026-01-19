import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn, getColorTextClass } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { sortedTaskLabelColors } from '../constants'
import type { AddProjectLabelFormValues } from '../validations'

export default function AddLabelForm() {
  const { control, watch, setValue } = useFormContext<AddProjectLabelFormValues>()
  const { t } = useTranslation()

  const color = watch('color')
  const title = watch('name')

  useEffect(() => {
    const color = sortedTaskLabelColors.flatMap((col) => col.shades).find((shade) => shade.isDefaultSelect)?.value
    setValue('color', color ?? '')
  }, [setValue])

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='bg-muted h-24 flex justify-center items-center'>
        <div
          className={cn(
            color
              ? sortedTaskLabelColors.flatMap((col) => col.shades).find((shade) => shade.value === color)?.value
              : 'bg-gray-200',
            'w-3/4 h-8 rounded-sm flex items-center px-3'
          )}
        >
          {title ? (
            <p className={cn('text-sm font-semibold truncate', getColorTextClass(color ?? ''))}>{title}</p>
          ) : null}
        </div>
      </div>

      <div className='px-4 space-y-4'>
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
                autoComplete='off'
                spellCheck={false}
                autoFocus={true}
              />
            </Field>
          )}
        />

        <Controller
          name='color'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name}>{t('task.label.chooseColor')}</FieldLabel>

              <div className='grid grid-cols-5 gap-2'>
                {sortedTaskLabelColors.map((col) => (
                  <div key={col.baseColor} className='flex flex-col gap-2'>
                    {col.shades.map((shade) => (
                      <div
                        key={shade.value}
                        role='button'
                        className={cn(
                          shade.value,
                          shade.value === field.value ? 'ring-2 ring-primary ring-offset-2' : '',
                          'w-full h-8 rounded cursor-pointer'
                        )}
                        onClick={() => field.onChange(shade.value)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </Field>
          )}
        />

        <div className='space-y-4 mt-4'>
          <Button type='button' size='sm' className='w-full' variant='secondary' onClick={() => setValue('color', '')}>
            <XIcon />
            {t('task.label.removeColor')}
          </Button>
          <Separator />
        </div>
      </div>
    </div>
  )
}
