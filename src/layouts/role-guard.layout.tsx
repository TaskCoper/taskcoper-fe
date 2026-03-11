import { useAuthStore } from '@/lib/zustand/auth.store'
import { getUserType } from '@/shared/utils'
import { Navigate, Outlet } from 'react-router'

export type RoleType = 'user' | 'orgAdmin' | 'superAdmin'

interface RoleGuardLayoutProps {
  allowedRoles: RoleType[]
  allowedUserRoles?: string[]
}

export default function RoleGuardLayout({ allowedRoles, allowedUserRoles }: RoleGuardLayoutProps) {
  const { user } = useAuthStore()
  const userType = getUserType(user)

  if (userType && !allowedRoles.includes(userType)) {
    if (userType === 'superAdmin') {
      return <Navigate to='/dashboard' replace />
    }

    if (userType === 'orgAdmin') {
      return <Navigate to='/manage' replace />
    }

    return <Navigate to='/projects' replace />
  }

  if (userType === 'user' && allowedUserRoles && user?.Role && !allowedUserRoles.includes(user.Role)) {
    return <Navigate to='/projects' replace />
  }

  return <Outlet />
}
