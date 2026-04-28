import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { getRoleHomePath, getUserType } from '@/shared/utils'
import { Navigate, Outlet } from 'react-router'

export type RoleType = 'user' | 'orgAdmin' | 'superAdmin'

interface RoleGuardLayoutProps {
  allowedRoles: RoleType[]
  allowedUserRoles?: string[]
}

export default function RoleGuardLayout({ allowedRoles, allowedUserRoles }: RoleGuardLayoutProps) {
  const { me, isGettingMe } = useGetMe()
  const userType = getUserType(me)

  if (isGettingMe) return null

  if (userType && !allowedRoles.includes(userType)) {
    return <Navigate to={getRoleHomePath(userType)} replace />
  }

  if (userType === 'user' && allowedUserRoles && me?.role && !allowedUserRoles.includes(me.role)) {
    return <Navigate to={getRoleHomePath('user')} replace />
  }

  return <Outlet />
}
