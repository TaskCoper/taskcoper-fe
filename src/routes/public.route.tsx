import GuardLayout from '@/layouts/guard.layout'
import HomePage from '@/pages/home.page'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const SignUpPage = lazy(() => import('@/pages/sign-up.page'))
const SignInPage = lazy(() => import('@/pages/sign-in.page'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password.page'))

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    element: <GuardLayout requiresAuth={false} />,
    children: [
      {
        path: '/sign-in',
        element: <SignInPage />
      },
      {
        path: '/sign-up',
        element: <SignUpPage />
      }
    ]
  }
]
