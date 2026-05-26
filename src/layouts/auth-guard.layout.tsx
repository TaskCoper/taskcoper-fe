import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType } from '@/shared/utils'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

interface AuthGuardLayoutProps {
  requiresAuth: boolean
}

export default function AuthGuardLayout({ requiresAuth }: AuthGuardLayoutProps) {
  const { t } = useTranslation()
  const { me, isGettingMe, isAuthenticated, isVerificationRequired } = useGetMe()

  // useSyncTimezone(me)

  const location = useLocation()

  const isOnVerifyPage = location.pathname === '/verify-email'
  const shouldRedirectToVerify = isVerificationRequired && !isOnVerifyPage

  if (isGettingMe) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <img src={logo} alt={t('common.alt.logo')} className='h-16 w-auto' />
      </div>
    )
  }

  if (shouldRedirectToVerify) {
    return <Navigate to='/verify-email' state={{ from: location }} replace />
  }

  if (requiresAuth) {
    if (isVerificationRequired && isOnVerifyPage) {
      return <Outlet />
    }

    if (!isAuthenticated || !me) {
      return <Navigate to='/sign-in' replace />
    }

    return <Outlet />
  }

  if (isAuthenticated && me && !isVerificationRequired && !isOnVerifyPage) {
    return <Navigate to={getRoleHomePath(getUserType(me))} replace />
  }

  return <Outlet />
}
