import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { isRedirectLoop, useRoleHomePath } from '@/lib/feature-flags'
import { getRoleHomePath, getUserType } from '@/shared/utils'
import { Navigate, Outlet, useLocation } from 'react-router'

export type RoleType = 'user' | 'orgAdmin' | 'superAdmin'

interface RoleGuardLayoutProps {
  allowedRoles: RoleType[]
  allowedUserRoles?: string[]
}

export default function RoleGuardLayout({ allowedRoles, allowedUserRoles }: RoleGuardLayoutProps) {
  const { me, isGettingMe } = useGetMe()
  const userType = getUserType(me)
  const userHomePath = useRoleHomePath()
  const location = useLocation()

  if (isGettingMe) return null

  if (userType && !allowedRoles.includes(userType)) {
    const roleHome = getRoleHomePath(userType)
    if (
      isRedirectLoop(
        location.pathname,
        roleHome,
        `RoleGuardLayout (RoleType "${userType}" not in [${allowedRoles.join(',')}])`
      )
    ) {
      return null
    }
    return <Navigate to={roleHome} replace />
  }

  if (userType === 'user' && allowedUserRoles && me?.role && !allowedUserRoles.includes(me.role)) {
    if (
      isRedirectLoop(
        location.pathname,
        userHomePath,
        `RoleGuardLayout (user role "${me.role}" not in [${allowedUserRoles.join(',')}])`
      )
    ) {
      return null
    }
    return <Navigate to={userHomePath} replace />
  }

  return <Outlet />
}
