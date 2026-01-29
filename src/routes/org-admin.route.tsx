import AuthGuardLayout from '@/layouts/auth-guard.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import OrgAdminManagePage from '@/pages/org-admins/org-admin.manage.page'
import type { RouteObject } from 'react-router'

export const orgAdminRoutes: RouteObject[] = [
  {
    element: <AuthGuardLayout requiresAuth={true} />,
    children: [
      {
        element: <RoleGuardLayout allowedRoles={['orgAdmin']} />,
        children: [
          {
            path: '/manage',
            element: <OrgAdminManagePage />
          }
        ]
      }
    ]
  }
]
