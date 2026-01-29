import AuthGuardLayout from '@/layouts/auth-guard.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import AdminDashboardPage from '@/pages/admins/admin-dashboard.page'
import type { RouteObject } from 'react-router'

export const adminRoutes: RouteObject[] = [
  {
    element: <AuthGuardLayout requiresAuth={true} />,
    children: [
      {
        element: <RoleGuardLayout allowedRoles={['superAdmin']} />,
        children: [
          {
            path: '/dashboard',
            element: <AdminDashboardPage />
          }
        ]
      }
    ]
  }
]
