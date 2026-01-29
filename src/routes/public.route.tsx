import AuthGuardLayout from '@/layouts/auth-guard.layout'
import HomePage from '@/pages/home.page'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const SignUpPage = lazy(() => import('@/pages/sign-up.page'))
const SignInPage = lazy(() => import('@/pages/sign-in.page'))
const ForgotPasswordPage = lazy(() => import('@/pages/users/forgot-password.page'))

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
    element: <AuthGuardLayout requiresAuth={false} />,
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
