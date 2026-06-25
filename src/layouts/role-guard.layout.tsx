import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useSignOut } from '@/features/auth/hooks/use-sign-out'
import { Role } from '@/features/users/types'
import { isRedirectLoop, useRoleHomePath } from '@/lib/feature-flags'
import { getRoleHomePath, getUserType } from '@/shared/utils'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router'
import { toast } from 'sonner'

export type RoleType = 'user' | 'orgAdmin' | 'superAdmin'

interface RoleGuardLayoutProps {
  allowedRoles: RoleType[]
  allowedUserRoles?: string[]
}

export default function RoleGuardLayout({ allowedRoles, allowedUserRoles }: RoleGuardLayoutProps) {
  const { t } = useTranslation()
  const { me, isGettingMe } = useGetMe()
  const userType = getUserType(me)
  const userHomePath = useRoleHomePath()
  const location = useLocation()
  const { signOut } = useSignOut()
  const hasSignedOutRef = useRef(false)

  const isNonAdmin = !!me && me.role !== Role.Admin

  useEffect(() => {
    if (!isNonAdmin || !me || hasSignedOutRef.current) {
      return
    }

    hasSignedOutRef.current = true
    toast.error(t('auth.signIn.adminOnly'))

    signOut({ email: me.email })
  }, [isNonAdmin, me, signOut, t])

  if (isGettingMe) {
    return null
  }

  if (isNonAdmin) {
    return null
  }

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
