/* eslint-disable react-refresh/only-export-components */
import AuthGuardLayout from '@/layouts/auth-guard.layout'
import RoleGuardLayout from '@/layouts/role-guard.layout'
import AuthRedirectPage from '@/pages/auth-redirect.page'
import HomePage from '@/pages/home.page'
import { lazy } from 'react'
import { type RouteObject } from 'react-router'

const SignUpPage = lazy(() => import('@/pages/sign-up.page'))
const SignInPage = lazy(() => import('@/pages/sign-in.page'))
const ForgotPasswordPage = lazy(() => import('@/pages/users/forgot-password.page'))

const TermsOfServicePage = lazy(() => import('@/pages/terms-of-service.page'))
const PrivacyPolicyPage = lazy(() => import('@/pages/privacy-policy.page'))

const CommissionsPage = lazy(() => import('@/pages/users/commissions.page'))

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/commissions',
    element: <CommissionsPage />
  },
  {
    element: <RoleGuardLayout allowedRoles={['user']} />,
    children: [
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />
      }
    ]
  },
  {
    path: '/redirect',
    element: <AuthRedirectPage />
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
  },
  {
    path: 'terms-of-service',
    element: <TermsOfServicePage />
  },
  {
    path: 'privacy-policy',
    element: <PrivacyPolicyPage />
  }
]
