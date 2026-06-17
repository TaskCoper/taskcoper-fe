import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { isRedirectLoop, useRoleHomePath, useTenantConfig } from '@/lib/feature-flags'
import i18n from '@/lib/i18n/i18n'
import { loadTenantNamespace } from '@/lib/i18n/load-tenant-namespace'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router'
import logo from '/images/taskcoper.png'

interface AuthGuardLayoutProps {
  requiresAuth: boolean
}

export default function AuthGuardLayout({ requiresAuth }: AuthGuardLayoutProps) {
  const { t } = useTranslation()
  const { me, isGettingMe, isAuthenticated, isVerificationRequired } = useGetMe()
  const roleHomePath = useRoleHomePath()
  const { i18nNamespace, locales } = useTenantConfig()

  useEffect(() => {
    if (!i18nNamespace || !locales) return

    loadTenantNamespace(i18nNamespace, locales)

    const onLanguageChanged = () => loadTenantNamespace(i18nNamespace, locales)
    i18n.on('languageChanged', onLanguageChanged)

    return () => {
      i18n.off('languageChanged', onLanguageChanged)
    }
  }, [i18nNamespace, locales])

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
    if (isRedirectLoop(location.pathname, roleHomePath, 'AuthGuardLayout (already authenticated)')) {
      return null
    }
    return <Navigate to={roleHomePath} replace />
  }

  return <Outlet />
}
