import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useChangePassword } from '../hooks/use-change-password'
import type { ChangePasswordFormValues } from '../validations'
import ChangePasswordForm from './change-password-form'

export default function PasswordSection() {
  const { t } = useTranslation()
  const { me } = useGetMe()
  const { methods, changePassword, isChangingPassword } = useChangePassword()

  const {
    handleSubmit,
    formState: { isDirty }
  } = methods

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = (body) => {
    changePassword({ body })
  }

  useEffect(() => {
    if (me) {
      document.title = `${me?.firstName} ${me?.lastName} | TaskCoper`
    }
  }, [me])

  return (
    <div>
      <p className='text-lg font-semibold'>{t('user.password.title')}</p>
      <p className='text-sm text-muted-foreground'>{t('user.password.description')}</p>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ChangePasswordForm />

          <div className='flex items-center justify-end gap-2'>
            <Button type='button' variant='link'>
              <Link to='/forgot-password'>{t('auth.signIn.forgotPassword')}</Link>
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
