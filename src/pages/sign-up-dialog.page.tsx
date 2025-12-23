import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import SignUpForm from '@/features/auth/components/sign-up-form'
import { useResendCode } from '@/features/auth/hooks/use-resend-code'
import { useSignUp } from '@/features/auth/hooks/use-sign-up'
import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email'
import type { SignUpFormValues, VerifyEmailFormValues } from '@/features/auth/validations'
import { useCountdown } from '@/hooks/use-countdown'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

export default function SignUpDialogPage() {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { signUpMethods, signUp, isSignUpPending, stage, setStage } = useSignUp()

  const { verifyEmailMethods, verifyEmail, isVerifyEmailPending } = useVerifyEmail({
    email: signUpMethods.getValues('email'),
    onSuccess: () => {
      signUpMethods.reset()
      verifyEmailMethods.reset()
      setStage('signUp')
    }
  })

  const { resendCode, isResendCodePending } = useResendCode()

  const { timeLeft, canResend, resetCountdown } = useCountdown({ seconds: 30, autoStart: stage === 'verifyEmail' })

  const onSignUp: SubmitHandler<SignUpFormValues> = (data) => {
    signUp({ body: data })
  }

  const onVerifyEmail: SubmitHandler<VerifyEmailFormValues> = (data) => {
    verifyEmail({ body: data })
  }

  const onResendCode = () => {
    resendCode({ email: signUpMethods.getValues('email') })
    resetCountdown()
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

        <div>
          {stage === 'signUp' ? (
            <FormProvider {...signUpMethods}>
              <form onSubmit={signUpMethods.handleSubmit(onSignUp)} className='w-full flex flex-col gap-4 p-4'>
                <div className='text-center'>
                  <p className='text-2xl font-bold'>{t('auth.signUp.title')}</p>
                  <p className='text-muted-foreground text-sm'>{t('auth.signUp.description')}</p>
                </div>

                <SignUpForm />

                <Button type='submit' disabled={isSignUpPending}>
                  {isSignUpPending ? <Spinner /> : null}
                  {t('auth.signUp.button')}
                </Button>

                <p className='text-sm mt-4 text-center'>
                  {t('auth.signUp.haveAccount')}{' '}
                  <Link className='text-primary underline font-medium' to='/sign-in'>
                    {t('auth.signIn.label')}
                  </Link>
                </p>
              </form>
            </FormProvider>
          ) : null}

          {stage === 'verifyEmail' ? (
            <FormProvider {...verifyEmailMethods}>
              <form
                onSubmit={verifyEmailMethods.handleSubmit(onVerifyEmail)}
                className='w-full flex flex-col items-center gap-4 p-4'
              >
                <div className='text-center'>
                  <p className='text-2xl font-bold'>{t('auth.signUp.verifyEmail.title')}</p>
                  <p className='text-muted-foreground text-sm'>{t('auth.signUp.verifyEmail.description')}</p>
                </div>

                <Controller
                  control={verifyEmailMethods.control}
                  name='code'
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      pattern={REGEXP_ONLY_DIGITS}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />

                <div className='space-x-2'>
                  <Button variant='outline' disabled={!canResend} onClick={onResendCode}>
                    {isResendCodePending ? <Spinner /> : null}
                    {t('auth.signUp.verifyEmail.resendCode')} {!canResend ? `(${timeLeft})` : null}
                  </Button>

                  <Button type='submit' disabled={isVerifyEmailPending}>
                    {isVerifyEmailPending ? <Spinner /> : null}
                    {t('auth.signUp.verifyEmail.button')}
                  </Button>
                </div>
              </form>
            </FormProvider>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
