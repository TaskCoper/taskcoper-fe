import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { hoaTheoMuaConfig } from '@/tenants/hoa-theo-mua/config'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router'
import { isRedirectLoop } from '../lib/feature-flags/redirect-loop'
import type { FeatureKey } from '../lib/feature-flags/types'
// TEMP: dynamic tenant identification disabled - using hoa-theo-mua config directly.
// import { resolveFeatureCheck, useTenantConfig } from '../lib/feature-flags/use-feature-flags'
import { resolveFeatureCheck } from '../lib/feature-flags/use-feature-flags'
import logo from '/images/taskcoper.png'

// Block render until `useGetMe` resolves. Otherwise the default (all-on) config
// briefly passes the guard before the real tenant config arrives, flashing the
// protected page.
function TenantConfigLoading() {
  const { t } = useTranslation()

  return (
    <div className='fixed inset-0 z-1000 flex items-center justify-center bg-background'>
      <img src={logo} alt={t('common.alt.logo')} className='h-16 w-auto' />
    </div>
  )
}

export function FeatureFlagGuardLayout({ requires }: { requires: FeatureKey }) {
  const { isGettingMe } = useGetMe()
  // TEMP: dynamic tenant identification disabled - using hoa-theo-mua config directly.
  // const config = useTenantConfig()
  const config = hoaTheoMuaConfig
  const location = useLocation()

  if (isGettingMe) return <TenantConfigLoading />

  const enabled = resolveFeatureCheck(config, requires)

  if (enabled) return <Outlet />

  if (isRedirectLoop(location.pathname, config.defaultLanding, `FeatureFlagGuardLayout (${requires} disabled)`)) {
    return null
  }

  return <Navigate to={config.defaultLanding} replace />
}

export function TenantLandingRedirect() {
  const { isGettingMe } = useGetMe()
  // TEMP: dynamic tenant identification disabled - using hoa-theo-mua config directly.
  // const config = useTenantConfig()
  const config = hoaTheoMuaConfig
  const location = useLocation()

  if (isGettingMe) return <TenantConfigLoading />

  if (isRedirectLoop(location.pathname, config.defaultLanding, 'TenantLandingRedirect (catch-all)')) {
    return null
  }

  return <Navigate to={config.defaultLanding} replace />
}
