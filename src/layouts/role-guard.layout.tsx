import { useAuthStore } from '@/lib/zustand/auth.store'
import { getUserType } from '@/shared/utils'
import { Navigate, Outlet } from 'react-router'

interface RoleGuardLayoutProps {
  allowedRoles: ('user' | 'orgAdmin' | 'superAdmin')[]
}

export default function RoleGuardLayout({ allowedRoles }: RoleGuardLayoutProps) {
  const { user } = useAuthStore()
  const userType = getUserType(user)

  if (!userType || !allowedRoles.includes(userType)) {
    if (userType === 'superAdmin') {
      return <Navigate to='/dashboard' replace />
    }

    if (userType === 'orgAdmin') {
      return <Navigate to='/manage' replace />
    }

    return <Navigate to='/projects' replace />
  }

  return <Outlet />
}
