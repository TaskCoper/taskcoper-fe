/* eslint-disable react-refresh/only-export-components */
import { FeatureFlagGuardLayout } from '@/layouts/feature-flag-guard.layout'
import { lazy } from 'react'
import { Outlet, type RouteObject } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from './config'

const OrdersDashboardPage = lazy(() => import('./pages/orders-dashboard.page'))
const OrdersListPage = lazy(() => import('./pages/orders-list.page'))
const OrdersCustomersPage = lazy(() => import('./pages/orders-customers.page'))

const ProductsListPage = lazy(() => import('./pages/products-list.page'))
const ProductPage = lazy(() => import('./pages/product.page'))

const RecruitmentJobsPage = lazy(() => import('./pages/recruitment-jobs.page'))
const RecruitmentJobPage = lazy(() => import('./pages/recruitment-job.page'))
const RecruitmentJobCreatePage = lazy(() => import('./pages/recruitment-job-create.page'))
const RecruitmentApplicantsPage = lazy(() => import('./pages/recruitment-applicants.page'))
const RecruitmentApplicantPage = lazy(() => import('./pages/recruitment-applicant.page'))

const AddressesListPage = lazy(() => import('./pages/addresses-list.page'))
const AddressesZonesPage = lazy(() => import('./pages/addresses-zones.page'))

const NewsArticlesPage = lazy(() => import('./pages/news-articles.page'))
const NewsCategoriesPage = lazy(() => import('./pages/news-categories.page'))
const NewsAddPage = lazy(() => import('./pages/news-add.page'))
const NewsUpdatePage = lazy(() => import('./pages/news-update-page'))
const NewsDetailPage = lazy(() => import('./pages/news-detail.page'))

const SystemConfigsPage = lazy(() => import('./pages/configs.page'))
const B2BOverviewEditorPage = lazy(() => import('./pages/configs-b2b-overview.page'))
const B2BServiceEditorPage = lazy(() => import('./pages/configs-b2b-service.page'))

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
        element: <FeatureFlagGuardLayout requires='custom.productManagement' />,
        children: [
          { path: 'products', element: <ProductsListPage /> },
          { path: 'products/:id', element: <ProductPage /> }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.recruitmentPortal' />,
        children: [
          { path: 'recruitment', element: <RecruitmentJobsPage /> },
          { path: 'recruitment/create', element: <RecruitmentJobCreatePage /> },
          { path: 'recruitment/applicants', element: <RecruitmentApplicantsPage /> },
          { path: 'recruitment/applicants/:id', element: <RecruitmentApplicantPage /> },
          { path: 'recruitment/:id', element: <RecruitmentJobPage /> }
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
          { path: 'news/:id/update', element: <NewsUpdatePage /> },
          { path: 'news/:id', element: <NewsDetailPage /> }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.systemConfigs' />,
        children: [
          { path: 'configs', element: <SystemConfigsPage /> },
          { path: 'configs/b2b-overview', element: <B2BOverviewEditorPage /> },
          { path: 'configs/b2b-service/:slug', element: <B2BServiceEditorPage /> }
        ]
      }
    ]
  }
]
