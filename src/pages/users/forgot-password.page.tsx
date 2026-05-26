import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { useForgotPassword } from '@/features/users/hooks/use-forgot-password'
import { useResetPassword } from '@/features/users/hooks/use-reset-password'
import { useVerifyCode } from '@/features/users/hooks/use-verify-code'
import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  VerifyCodeFormValues
} from '@/features/users/validations'
import { useCountdown } from '@/hooks/use-countdown'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [stage, setStage] = useState<'email' | 'otp' | 'password'>('email')
  const [isVisible, setIsVisible] = useState(false)

  const { methods: forgotPasswordMethods, forgotPassword, isForgotPasswordPending } = useForgotPassword()
  const { methods: verifyCodeMethods, verifyCode, isVerifyingCode } = useVerifyCode()
  const { methods: resetPasswordMethods, resetPassword, isResettingPassword } = useResetPassword()

  const { timeLeft, canResend, resetCountdown } = useCountdown({
    seconds: 30,
    autoStart: stage === 'otp'
  })

  const handleResend = () => {
    forgotPassword({ body: { email: verifyCodeMethods.getValues('email') } })
    resetCountdown()
  }

  const onSubmitForgotPassword: SubmitHandler<ForgotPasswordFormValues> = (body) => {
    forgotPassword(
      { body },
      {
        onSuccess: () => {
          setStage('otp')
          verifyCodeMethods.reset({
            code: '',
            email: forgotPasswordMethods.getValues('email')
          })
        }
      }
    )
  }

  const onSubmitVerifyCode: SubmitHandler<VerifyCodeFormValues> = (body) => {
    verifyCode(
      { body },
      {
        onSuccess: () => {
          resetPasswordMethods.reset({ newPassword: '' })
          setStage('password')
        }
      }
    )
  }

  const onSubmitResetPassword: SubmitHandler<ResetPasswordFormValues> = (body) => {
    resetPassword(
      { body },
      {
        onSuccess: () => {
          setStage('email')
        }
      }
    )
  }

  return (
    <div className='flex justify-center items-center min-h-screen p-4 bg-linear-to-br from-blue-600 via-cyan-400 to-green-600'>
      <Card className='grid grid-cols-1 lg:grid-cols-12 w-full max-w-md lg:max-w-6xl h-auto lg:h-[600px] p-2 lg:p-4 shadow-xl'>
        <div className='hidden lg:block lg:col-span-7 h-full'>
          <img
            src='/images/auth-bg.jpg'
            alt='Verification background'
            className='w-full h-full object-cover rounded-lg'
          />
        </div>

        <div className='col-span-1 lg:col-span-5 flex flex-col justify-center items-center px-4 py-8 lg:py-0 lg:px-8'>
          {stage === 'email' ? (
            <FormProvider {...forgotPasswordMethods}>
              <form onSubmit={forgotPasswordMethods.handleSubmit(onSubmitForgotPassword)} className='space-y-8'>
                <div className='text-center'>
                  <p className='text-2xl font-bold'>{t('auth.forgotPassword.title')}</p>
                  <p className='text-muted-foreground text-sm'>{t('auth.forgotPassword.description')}</p>
                </div>

                <div className='space-y-1'>
                  <Controller
                    name='email'
                    control={forgotPasswordMethods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel htmlFor={field.name} className='gap-0.5'>
                          {t('auth.signUp.field.email.label')}
                          <span className='text-destructive font-semibold'>*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder={t('auth.signUp.field.email.placeholder')}
                          spellCheck={false}
                          autoFocus
                        />
                        <div className='min-h-4'>
                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </div>
                      </Field>
                    )}
                  />

                  <Button type='submit' className='w-full' disabled={isForgotPasswordPending}>
                    {isForgotPasswordPending ? <Spinner /> : null}
                    {t('auth.forgotPassword.sendEmail')}
                  </Button>

                  <p className='text-sm mt-12 text-center'>
                    {t('auth.forgotPassword.rememberPassword')}{' '}
                    <Link className='text-primary underline font-medium' to='/sign-in'>
                      {t('auth.signIn.label')}
                    </Link>
                  </p>
                </div>
              </form>
            </FormProvider>
          ) : null}

          {stage === 'otp' ? (
            <FormProvider {...verifyCodeMethods}>
              <form onSubmit={verifyCodeMethods.handleSubmit(onSubmitVerifyCode)} className='flex flex-col gap-8'>
                <div className='text-center'>
                  <p className='text-2xl font-bold'>{t('auth.verifyOtp.title')}</p>
                  <p className='text-muted-foreground text-sm'>
                    {t('auth.verifyOtp.emailSent')}{' '}
                    <span className='font-medium text-foreground'>{verifyCodeMethods.getValues('email')}.</span>
                  </p>
                  <p className='text-muted-foreground text-sm'>{t('auth.verifyOtp.checkInbox')}</p>
                </div>

                <div className='mx-auto'>
                  <Controller
                    control={verifyCodeMethods.control}
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
                </div>

                <div className='flex justify-center items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={!canResend || isForgotPasswordPending}
                    onClick={handleResend}
                  >
                    {isForgotPasswordPending && <Spinner />}
                    {t('auth.signUp.verifyEmail.resendCode')} {!canResend ? `(${timeLeft})` : null}
                  </Button>

                  <Button type='submit' disabled={isVerifyingCode}>
                    {isVerifyingCode ? <Spinner /> : null}
                    {t('auth.verifyOtp.continue')}
                  </Button>
                </div>

                <p className='text-sm mt-4 text-center'>
                  {t('auth.verifyOtp.wrongEmail')}{' '}
                  <Button
                    variant='link'
                    className='px-0 underline'
                    onClick={() => {
                      forgotPasswordMethods.reset({ email: '' })
                      setStage('email')
                    }}
                  >
                    {t('auth.verifyOtp.goBack')}
                  </Button>
                </p>
              </form>
            </FormProvider>
          ) : null}

          {stage === 'password' ? (
            <FormProvider {...resetPasswordMethods}>
              <form onSubmit={resetPasswordMethods.handleSubmit(onSubmitResetPassword)} className='space-y-8'>
                <div className='text-center'>
                  <p className='text-2xl font-bold'>{t('auth.resetPassword.title')}</p>
                  <p className='text-muted-foreground text-sm'>{t('auth.resetPassword.description')}</p>
                </div>

                <div className='space-y-1'>
                  <Controller
                    name='newPassword'
                    control={resetPasswordMethods.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className='gap-1'>
                        <FieldLabel htmlFor={field.name} className='gap-0.5'>
                          {t('auth.resetPassword.newPassword.label')}
                          <span className='text-destructive font-semibold'>*</span>
                        </FieldLabel>

                        <div className='relative'>
                          <Input
                            {...field}
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            type={isVisible ? 'text' : 'password'}
                            placeholder={t('auth.resetPassword.newPassword.placeholder')}
                            spellCheck={false}
                            autoFocus
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

                  <Button type='submit' className='w-full' disabled={isResettingPassword}>
                    {isResettingPassword ? <Spinner /> : null}
                    {t('auth.resetPassword.reset')}
                  </Button>

                  <p className='text-sm mt-12 text-center'>
                    {t('auth.forgotPassword.rememberPassword')}{' '}
                    <Link className='text-primary underline font-medium' to='/sign-in'>
                      {t('auth.signIn.label')}
                    </Link>
                  </p>
                </div>
              </form>
            </FormProvider>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
