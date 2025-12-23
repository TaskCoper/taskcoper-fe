import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import SignInForm from '@/features/auth/components/sign-in-form'
import { useSignIn } from '@/features/auth/hooks/use-sign-in'
import type { SignInFormValues } from '@/features/auth/validations'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

export default function SignInDialogPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const { signInMethods, isSignInPending, signIn } = useSignIn()

  const onSignIn: SubmitHandler<SignInFormValues> = (data) => {
    signIn({ body: data })
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      navigate('/')
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        position='top-center'
        className='w-md p-4 gap-0'
        onInteractOutside={handleClose}
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Task Detail</DialogTitle>
            <DialogDescription>Task Description</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <FormProvider {...signInMethods}>
          <form onSubmit={signInMethods.handleSubmit(onSignIn)} className='w-full flex flex-col gap-4 p-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{t('auth.signIn.title')}</p>
              <p className='text-muted-foreground text-sm'>{t('auth.signIn.description')}</p>
            </div>

            <SignInForm />

            <Button type='submit' disabled={isSignInPending}>
              {isSignInPending ? <Spinner /> : null}
              {t('auth.signIn.button')}
            </Button>

            <p className='text-sm mt-4 text-center'>
              {t('auth.signIn.noAccount')}{' '}
              <Link className='text-primary underline font-medium' to='/sign-up'>
                {t('auth.signUp.label')}
              </Link>
            </p>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
