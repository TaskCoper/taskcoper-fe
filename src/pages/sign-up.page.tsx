import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import SignUpForm from '@/features/auth/components/sign-up-form'
import VerifyEmailForm from '@/features/auth/components/verify-email-form'
import { useSignUp } from '@/features/auth/hooks/use-sign-up'
import type { SignUpFormValues } from '@/features/auth/validations'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

export default function SignUpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { signUpMethods, signUp, isSigningUp, stage, setStage } = useSignUp()

  const onSignUp: SubmitHandler<SignUpFormValues> = (data) => {
    signUp({ body: data })
  }

  return (
    <div className='flex justify-center items-center min-h-screen p-4 bg-linear-to-br from-blue-600 via-cyan-400 to-green-600'>
      <Card className='grid grid-cols-1 lg:grid-cols-12 w-full max-w-md lg:max-w-6xl h-auto lg:h-[600px] p-2 lg:p-4 shadow-xl'>
        <div className='hidden lg:block lg:col-span-7 h-full'>
          <img src='/images/auth-bg.jpg' alt='auth-bg' className='w-full h-full object-cover rounded-lg' />
        </div>

        <div className='col-span-1 lg:col-span-5 flex justify-center items-center px-2 py-8 lg:py-0'>
          {stage === 'signUp' ? (
            <FormProvider {...signUpMethods}>
              <form
                onSubmit={signUpMethods.handleSubmit(onSignUp)}
                className='w-full flex flex-col gap-8 lg:gap-12 p-4'
              >
                <div className='text-center'>
                  <p className='text-2xl font-bold'>{t('auth.signUp.title')}</p>
                  <p className='text-muted-foreground text-sm'>{t('auth.signUp.description')}</p>
                </div>

                <div className='w-full flex flex-col gap-4 px-2 sm:px-6'>
                  <SignUpForm />

                  <Button type='submit' disabled={isSigningUp} className='w-full'>
                    {isSigningUp ? <Spinner /> : null}
                    {t('auth.signUp.button')}
                  </Button>

                  <p className='text-sm mt-4 text-center'>
                    {t('auth.signUp.haveAccount')}{' '}
                    <Link className='text-primary underline font-medium' to='/sign-in'>
                      {t('auth.signIn.label')}
                    </Link>
                  </p>
                </div>
              </form>
            </FormProvider>
          ) : null}

          {stage === 'verifyEmail' ? (
            <div className='w-full px-4'>
              <VerifyEmailForm
                email={signUpMethods.getValues('email')}
                onSuccess={() => {
                  signUpMethods.reset()
                  setStage('signUp')
                  navigate('/projects', { replace: true })
                }}
              />
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
