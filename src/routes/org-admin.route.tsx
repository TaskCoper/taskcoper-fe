import AdminDefaultLayout from '@/layouts/admin-default.layout'
import AuthGuardLayout from '@/layouts/auth-guard.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import ManagePage from '@/pages/org-admins/manage.page'
import type { RouteObject } from 'react-router'

export const orgAdminRoutes: RouteObject[] = [
  {
    element: <AuthGuardLayout requiresAuth={true} />,
    children: [
      {
        element: <RoleGuardLayout allowedRoles={['orgAdmin']} />,
        children: [
          {
            path: 'manage',
            element: <AdminDefaultLayout basePath='/manage' />,
            children: [
              {
                index: true,
                element: <ManagePage />
              }
            ]
          }
        ]
      }
    ]
  }
]
