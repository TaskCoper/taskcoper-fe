import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { Navigate, Outlet, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

interface GuardLayoutProps {
  requiresAuth: boolean
}

export default function GuardLayout({ requiresAuth }: GuardLayoutProps) {
  const { isAuthenticated, isVerificationRequired } = useAuthStore()

  const { me, isGettingMe } = useGetMe()

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
    return <Navigate to='/projects' replace />
  }

  return <Outlet />
}
