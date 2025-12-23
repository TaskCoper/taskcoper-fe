import GuardLayout from '@/layouts/guard.layout'
import HomePage from '@/pages/home.page'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const SignUpDialogPage = lazy(() => import('@/pages/sign-up-dialog.page'))
const SignInDialogPage = lazy(() => import('@/pages/sign-in-dialog.page'))

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
    children: [
      {
        element: <GuardLayout requiresAuth={false} />,
        children: [
          {
            path: 'sign-in',
            element: <SignInDialogPage />
          },
          {
            path: 'sign-up',
            element: <SignUpDialogPage />
          }
        ]
      }
    ]
  }
]
