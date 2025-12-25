import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { SignUpFormValues } from '../validations'

export default function SignUpForm() {
  const [isVisible, setIsVisible] = useState(false)
  const { control } = useFormContext<SignUpFormValues>()
  const { t } = useTranslation()

  return (
    <div className='space-y-1'>
      <div className='flex flex-col sm:flex-row sm:gap-4'>
        <Controller
          name='firstName'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
              <FieldLabel htmlFor={field.name}>{t('auth.signUp.fields.firstName')}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
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

        <Controller
          name='lastName'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1 w-full'>
              <FieldLabel htmlFor={field.name}>{t('auth.signUp.fields.lastName')}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete='off'
                spellCheck={false}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <Controller
        name='email'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.fields.email.label')}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('auth.signUp.fields.email.placeholder')}
              autoComplete='off'
              spellCheck={false}
            />
            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='password'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name}>{t('auth.signUp.fields.password.label')}</FieldLabel>
            <div className='relative'>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type={isVisible ? 'text' : 'password'}
                placeholder={t('auth.signUp.fields.password.placeholder')}
                autoComplete='off'
                spellCheck={false}
              />
              <Button
                variant='ghost'
                type='button'
                size='icon'
                onClick={() => {
                  setIsVisible((prevState) => !prevState)
                }}
                className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
              >
                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />
    </div>
  )
}
