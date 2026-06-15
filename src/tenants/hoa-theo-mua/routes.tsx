/* eslint-disable react-refresh/only-export-components */
import { FeatureFlagGuardLayout } from '@/lib/feature-flags'
import { lazy } from 'react'
import type { RouteObject } from 'react-router'

const OrdersDashboardPage = lazy(() => import('./pages/orders-dashboard.page'))
const OrdersListPage = lazy(() => import('./pages/orders-list.page'))
const OrdersCustomersPage = lazy(() => import('./pages/orders-customers.page'))

const RecruitmentJobsPage = lazy(() => import('./pages/recruitment-jobs.page'))
const RecruitmentApplicantsPage = lazy(() => import('./pages/recruitment-applicants.page'))

const AddressesListPage = lazy(() => import('./pages/addresses-list.page'))
const AddressesZonesPage = lazy(() => import('./pages/addresses-zones.page'))

const CustomNewsArticlesPage = lazy(() => import('./pages/custom-news-articles.page'))
const CustomNewsCategoriesPage = lazy(() => import('./pages/custom-news-categories.page'))

export const hoaTheoMuaWorkspaceRoutes: RouteObject[] = [
  {
    element: <FeatureFlagGuardLayout requires='custom.orderManagement' />,
    children: [
      { path: 'orders', element: <OrdersListPage /> },
      { path: 'orders/dashboard', element: <OrdersDashboardPage /> },
      { path: 'orders/customers', element: <OrdersCustomersPage /> }
    ]
  },
  {
    element: <FeatureFlagGuardLayout requires='custom.recruitmentPortal' />,
    children: [
      { path: 'recruitment', element: <RecruitmentJobsPage /> },
      { path: 'recruitment/applicants', element: <RecruitmentApplicantsPage /> }
    ]
  },
  {
    element: <FeatureFlagGuardLayout requires='custom.addressManagement' />,
    children: [
      { path: 'addresses', element: <AddressesListPage /> },
      { path: 'addresses/zones', element: <AddressesZonesPage /> }
    ]
  },
  {
    element: <FeatureFlagGuardLayout requires='custom.customNewsPage' />,
    children: [
      { path: 'custom-news', element: <CustomNewsArticlesPage /> },
      { path: 'custom-news/categories', element: <CustomNewsCategoriesPage /> }
    ]
  }
]
