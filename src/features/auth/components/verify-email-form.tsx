import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { useResendCode } from '@/features/auth/hooks/use-resend-code'
import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email'
import { type VerifyEmailFormValues } from '@/features/auth/validations'
import { useCountdown } from '@/hooks/use-countdown'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface VerifyEmailFormProps {
  email: string
  onSuccess?: () => void
  autoStart?: boolean
}

export default function VerifyEmailForm({ email, onSuccess, autoStart = true }: VerifyEmailFormProps) {
  const { t } = useTranslation()

  const { verifyEmailMethods, verifyEmail, isVerifyingEmail } = useVerifyEmail({
    email,
    onSuccess
  })

  const { resendCode, isResendingCode } = useResendCode()
  const { timeLeft, canResend, resetCountdown } = useCountdown({
    seconds: 30,
    autoStart
  })

  const onVerifyEmail: SubmitHandler<VerifyEmailFormValues> = (data) => {
    verifyEmail({ body: data })
  }

  const handleResend = () => {
    resendCode({ email })
    resetCountdown()
  }

  return (
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
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
        />

        <div className='space-x-2'>
          <Button type='button' variant='outline' disabled={!canResend || isResendingCode} onClick={handleResend}>
            {isResendingCode && <Spinner />}
            {t('auth.signUp.verifyEmail.resendCode')} {!canResend ? `(${timeLeft})` : null}
          </Button>

          <Button type='submit' disabled={isVerifyingEmail}>
            {isVerifyingEmail && <Spinner />}
            {t('auth.signUp.verifyEmail.button')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
