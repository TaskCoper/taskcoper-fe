/* eslint-disable react-refresh/only-export-components */
import { FeatureFlagGuardLayout } from '@/lib/feature-flags'
import { lazy } from 'react'
import { Outlet, type RouteObject } from 'react-router'

const OrdersDashboardPage = lazy(() => import('./pages/orders-dashboard.page'))
const OrdersListPage = lazy(() => import('./pages/orders-list.page'))
const OrdersCustomersPage = lazy(() => import('./pages/orders-customers.page'))

const RecruitmentJobsPage = lazy(() => import('./pages/recruitment-jobs.page'))
const RecruitmentApplicantsPage = lazy(() => import('./pages/recruitment-applicants.page'))

const AddressesListPage = lazy(() => import('./pages/addresses-list.page'))
const AddressesZonesPage = lazy(() => import('./pages/addresses-zones.page'))

const NewsArticlesPage = lazy(() => import('./pages/news-articles.page'))
const NewsCategoriesPage = lazy(() => import('./pages/news-categories.page'))
const NewsAddPage = lazy(() => import('./pages/news-add.page'))
const NewsUpdatePage = lazy(() => import('./pages/news-update-page'))
const NewsDetailPage = lazy(() => import('./pages/news-detail.page'))

export const HOA_THEO_MUA_ROUTE_PREFIX = 'htm'

export const hoaTheoMuaWorkspaceRoutes: RouteObject[] = [
  {
    path: HOA_THEO_MUA_ROUTE_PREFIX,
    element: <Outlet />,
    children: [
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
          { path: 'news', element: <NewsArticlesPage /> },
          { path: 'news/categories', element: <NewsCategoriesPage /> },
          { path: 'news/add', element: <NewsAddPage /> },
          { path: 'news/update', element: <NewsUpdatePage /> },
          { path: 'news/detail', element: <NewsDetailPage /> }
        ]
      }
    ]
  }
]
