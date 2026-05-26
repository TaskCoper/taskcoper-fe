import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { useCountdown } from '@/hooks/use-countdown'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useResendCode } from '../hooks/use-resend-code'
import { useVerifyEmail } from '../hooks/use-verify-email'
import { type VerifyEmailFormValues } from '../validations'

interface VerifyEmailFormProps {
  email: string
  onSuccess?: () => void
  autoStart?: boolean
}

export default function VerifyEmailForm({ email, onSuccess, autoStart = true }: VerifyEmailFormProps) {
  const { t } = useTranslation()

  const { verifyEmailMethods, verifyEmail, isVerifyingEmail } = useVerifyEmail({
    email
  })

  const { resendCode, isResendingCode } = useResendCode()
  const { timeLeft, canResend, resetCountdown } = useCountdown({
    seconds: 30,
    autoStart
  })

  const onVerifyEmail: SubmitHandler<VerifyEmailFormValues> = (data) => {
    verifyEmail(
      { body: data },
      {
        onSuccess: () => {
          onSuccess?.()
        }
      }
    )
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
          <p className='text-muted-foreground text-sm'>
            {t('auth.signUp.verifyEmail.description')} ({email})
          </p>
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
