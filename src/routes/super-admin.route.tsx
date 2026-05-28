/* eslint-disable react-refresh/only-export-components */
import AdminDefaultLayout from '@/layouts/admin-default.layout'
import AuthGuardLayout from '@/layouts/auth-guard.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import type { I18nKey } from '@/lib/i18n/types'
import { lazy } from 'react'
import { useTranslation } from 'react-i18next'
import type { RouteObject } from 'react-router'

const SystemProjectsPage = lazy(() => import('@/pages/super-admins/system-projects.page'))
const SystemUsersPage = lazy(() => import('@/pages/super-admins/system-users.page'))
const SystemMentorApplicationsPage = lazy(() => import('@/pages/super-admins/system-mentor-applications.page'))
const CommissionsPage = lazy(() => import('@/pages/super-admins/commissions.page'))
const DashboardPage = lazy(() => import('@/pages/super-admins/dashboard.page'))

function AdminRoutePlaceholder({ titleKey }: { titleKey: I18nKey }) {
  const { t } = useTranslation()
  return <div>{t(titleKey)}</div>
}

export const adminRoutes: RouteObject[] = [
  {
    element: <AuthGuardLayout requiresAuth={true} />,
    children: [
      {
        element: <RoleGuardLayout allowedRoles={['superAdmin']} />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDefaultLayout basePath='/dashboard' />,
            children: [
              {
                index: true,
                element: <DashboardPage />
              },
              {
                path: 'projects',
                children: [
                  {
                    index: true,
                    element: <SystemProjectsPage />
                  },
                  {
                    path: ':projectId',
                    element: <AdminRoutePlaceholder titleKey='admin.route.projectDetail' />
                  },
                  {
                    path: 'settings',
                    element: <AdminRoutePlaceholder titleKey='admin.route.projectSettings' />
                  }
                ]
              },
              {
                path: 'users',
                children: [
                  {
                    index: true,
                    element: <SystemUsersPage />
                  }
                ]
              },
              {
                path: 'applications',
                children: [
                  {
                    index: true,
                    element: <SystemMentorApplicationsPage />
                  }
                ]
              },
              {
                path: 'commisions',
                children: [
                  {
                    index: true,
                    element: <CommissionsPage />
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
