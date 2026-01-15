import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useChangePassword } from '../hooks/use-change-password'
import type { ChangePasswordFormValues } from '../validations'
import ChangePasswordForm from './change-password-form'

export default function PasswordSection() {
  const { t } = useTranslation()
  const { methods, changePassword, isChangingPassword } = useChangePassword()

  const {
    handleSubmit,
    formState: { isDirty }
  } = methods

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = (body) => {
    changePassword({ body })
  }

  return (
    <div className='px-24 pb-6'>
      <p className='text-lg font-semibold'>{t('user.password.title')}</p>
      <p className='text-sm text-muted-foreground'>{t('user.password.description')}</p>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ChangePasswordForm />

          <div className='flex items-center justify-end gap-2'>
            <Button type='button' variant='link'>
              {t('auth.signIn.forgotPassword')}
            </Button>

            <Button type='submit' disabled={!isDirty || isChangingPassword}>
              {isChangingPassword ? <Spinner /> : null}
              {t('user.password.saveChanges')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
