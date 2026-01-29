import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import VerifyEmailForm from '@/features/auth/components/verify-email-form'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'

export default function VerifyEmailPage() {
  const { t } = useTranslation()
  const { user, isVerificationRequired, setVerificationRequired, signOut } = useAuthStore()
  const navigate = useNavigate()

  if (!user?.Email) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (!isVerificationRequired) {
    return <Navigate to='/projects' replace />
  }

  const handleVerifySuccess = () => {
    setVerificationRequired(false)
    navigate('/projects', { replace: true })
  }

  const handleSignOut = () => {
    signOut()
    navigate('/sign-in', { replace: true })
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
          <VerifyEmailForm email={user.Email} onSuccess={handleVerifySuccess} />

          <Button type='button' variant='link' className='mt-8 lg:mt-10' onClick={handleSignOut}>
            {t('auth.signUp.verifyEmail.useDifferentAccount')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
