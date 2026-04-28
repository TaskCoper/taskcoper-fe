import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType } from '@/shared/utils'
import { Navigate } from 'react-router'
import logo from '/images/taskcoper.png'

export default function AuthRedirectPage() {
  const { me, isGettingMe, isAuthenticated, isVerificationRequired } = useGetMe()

  if (isGettingMe) {
    return (
      <div className='h-screen flex flex-col items-center justify-center gap-4'>
        <img src={logo} alt='TaskCoper' className='h-16 w-auto' />
      </div>
    )
  }

  if (!isAuthenticated || !me) {
    return <Navigate to='/sign-in' replace />
  }

  if (isVerificationRequired) {
    return <Navigate to='/verify-email' replace />
  }

  return <Navigate to={getRoleHomePath(getUserType(me))} replace />
}
