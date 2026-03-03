import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { ChangePasswordFormValues } from '../validations'

export default function ChangePasswordForm() {
  const { t } = useTranslation()
  const { control } = useFormContext<ChangePasswordFormValues>()

  const [isVisibleOldPassword, setIsVisibleOldPassword] = useState(false)
  const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false)

  return (
    <div className='mt-8'>
      <Controller
        name='currentPassword'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('user.changePassword.currentPassword.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>
            <div className='relative'>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type={isVisibleOldPassword ? 'text' : 'password'}
                placeholder={t('user.changePassword.currentPassword.placeholder')}
                spellCheck={false}
              />
              <Button
                variant='ghost'
                type='button'
                size='icon'
                onClick={() => {
                  setIsVisibleOldPassword((prevState) => !prevState)
                }}
                className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
              >
                {isVisibleOldPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )}
      />

      <Controller
        name='newPassword'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('user.changePassword.newPassword.label')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>
            <div className='relative'>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type={isVisibleNewPassword ? 'text' : 'password'}
                placeholder={t('user.changePassword.newPassword.placeholder')}
                spellCheck={false}
              />
              <Button
                variant='ghost'
                type='button'
                size='icon'
                onClick={() => {
                  setIsVisibleNewPassword((prevState) => !prevState)
                }}
                className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
              >
                {isVisibleNewPassword ? <EyeOffIcon /> : <EyeIcon />}
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
