import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useSyncTimezone } from '@/features/auth/hooks/use-sync-timezone'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { getUserType } from '@/shared/utils'
import { Navigate, Outlet, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

interface AuthGuardLayoutProps {
  requiresAuth: boolean
}

export default function AuthGuardLayout({ requiresAuth }: AuthGuardLayoutProps) {
  const { isAuthenticated, isVerificationRequired, user } = useAuthStore()
  const { me, isGettingMe } = useGetMe()

  useSyncTimezone(me)

  const location = useLocation()

  const isOnVerifyPage = location.pathname === '/verify-email'

  if (isAuthenticated && isGettingMe) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <img src={logo} alt='TaskCoper' className='h-16 w-auto' />
      </div>
    )
  }

  if (isAuthenticated && isVerificationRequired && !isOnVerifyPage) {
    return <Navigate to='/verify-email' state={{ from: location }} replace />
  }

  if (requiresAuth) {
    if (!isAuthenticated) {
      return <Navigate to='/sign-in' replace />
    }

    if (!me && !isOnVerifyPage) {
      return <Navigate to='/sign-in' replace />
    }

    return <Outlet />
  }

  if (isAuthenticated && me && !isVerificationRequired && !isOnVerifyPage) {
    const userType = getUserType(user)

    if (userType === 'superAdmin') return <Navigate to='/dashboard' replace />
    if (userType === 'orgAdmin') return <Navigate to='/manage' replace />
    return <Navigate to='/projects' replace />
  }

  return <Outlet />
}
