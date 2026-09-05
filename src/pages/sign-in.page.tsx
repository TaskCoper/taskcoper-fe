import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import SignInForm from '@/features/auth/components/sign-in-form'
import { useSignIn } from '@/features/auth/hooks/use-sign-in'
import type { SignInFormValues } from '@/features/auth/validations'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
// import { Link } from 'react-router'

export default function SignInDialogPage() {
  const { t } = useTranslation()
  const { signInMethods, isSigningIn, signIn } = useSignIn()

  const onSignIn: SubmitHandler<SignInFormValues> = (data) => {
    signIn({ body: data })
  }

  return (
    <div className='flex justify-center items-center min-h-screen p-4 bg-linear-to-br from-blue-600 via-cyan-400 to-green-600'>
      <Card className='grid grid-cols-1 lg:grid-cols-12 w-full max-w-md lg:max-w-6xl h-auto lg:h-[600px] p-2 lg:p-4 rounded-3xl'>
        <div className='hidden lg:block lg:col-span-7 h-full'>
          <img
            src='/images/auth-bg.jpg'
            alt={t('common.alt.authBackground')}
            className='w-full h-full object-cover rounded-2xl'
          />
        </div>

        <div className='col-span-1 lg:col-span-5 flex justify-center items-center'>
          <FormProvider {...signInMethods}>
            <form
              onSubmit={signInMethods.handleSubmit(onSignIn)}
              className='w-full flex flex-col gap-8 lg:gap-12 p-4 py-8 lg:py-4'
            >
              <div className='text-center'>
                <p className='text-2xl font-bold'>{t('auth.signIn.title')}</p>
                <p className='text-muted-foreground text-sm'>{t('auth.signIn.description')}</p>
              </div>

              <div className='w-full flex flex-col gap-4 px-2 sm:px-6'>
                <SignInForm />

                <Button type='submit' disabled={isSigningIn} className='w-full'>
                  {isSigningIn ? <Spinner /> : null}
                  {t('auth.signIn.button')}
                </Button>

                {/* Sign-up flow disabled */}
                {/* <p className='text-sm mt-4 text-center'>
                  {t('auth.signIn.noAccount')}{' '}
                  <Link className='text-primary underline font-medium' to='/sign-up'>
                    {t('auth.signUp.label')}
                  </Link>
                </p> */}
              </div>
            </form>
          </FormProvider>
        </div>
      </Card>
    </div>
  )
}
