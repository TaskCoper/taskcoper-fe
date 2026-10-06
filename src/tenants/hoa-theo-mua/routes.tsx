/* eslint-disable react-refresh/only-export-components */
import { FeatureFlagGuardLayout } from '@/layouts/feature-flag-guard.layout'
import { lazy } from 'react'
import { Outlet, type RouteObject } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from './config'

const AiCardsPage = lazy(() => import('./pages/ai-cards.page'))
const AiCardDetailPage = lazy(() => import('./pages/ai-card-detail.page'))
const AiFlowerDesignsPage = lazy(() => import('./pages/ai-flower-designs.page'))
const AiFlowerDesignDetailPage = lazy(() => import('./pages/ai-flower-design-detail.page'))
const CardTemplatesPage = lazy(() => import('./pages/card-templates.page'))
const FlowerMockupsPage = lazy(() => import('./pages/flower-mockups.page'))
const CardSizesPage = lazy(() => import('./pages/card-sizes.page'))
const HandwritingSurchargePage = lazy(() => import('./pages/handwriting-surcharge.page'))
const OrdersPage = lazy(() => import('./pages/orders.page'))
const OrderPage = lazy(() => import('./pages/order.page'))
const SystemOrdersPage = lazy(() => import('./pages/system-orders.page'))
const SystemOrderPage = lazy(() => import('./pages/system-order.page'))

const ProductPage = lazy(() => import('./pages/product.page'))
const ProductsPage = lazy(() => import('./pages/products.page'))
const PinnedProductsPage = lazy(() => import('./pages/pinned-products.page'))

const ProductCategoriesPage = lazy(() => import('./pages/product-categories.page'))
const ProductCategoriesSortPage = lazy(() => import('./pages/product-categories-sort.page'))

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
const VouchersPage = lazy(() => import('./pages/vouchers.page'))
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
          { path: 'orders', element: <OrdersPage /> },
          { path: 'system-orders', element: <SystemOrdersPage /> },
          { path: 'system-orders/:id', element: <SystemOrderPage /> },
          { path: 'orders/:id', element: <OrderPage /> }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.productManagement' />,
        children: [
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/pinned', element: <PinnedProductsPage /> },
          { path: 'products/categories', element: <ProductCategoriesPage /> },
          { path: 'products/categories/sort', element: <ProductCategoriesSortPage /> },
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
          { path: 'news/:slug/update', element: <NewsUpdatePage /> },
          { path: 'news/:slug', element: <NewsDetailPage /> }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.systemConfigs' />,
        children: [
          { path: 'configs', element: <SystemConfigsPage /> },
          { path: 'vouchers', element: <VouchersPage /> },
          { path: 'configs/b2b-overview', element: <B2BOverviewEditorPage /> },
          { path: 'configs/b2b-service/:slug', element: <B2BServiceEditorPage /> }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.aiCustom' />,
        children: [
          {
            path: 'ai-custom/cards',
            element: <AiCardsPage />
          },
          {
            path: 'ai-custom/cards/:id',
            element: <AiCardDetailPage />
          },
          {
            path: 'ai-custom/flower-designs',
            element: <AiFlowerDesignsPage />
          },
          {
            path: 'ai-custom/flower-designs/:id',
            element: <AiFlowerDesignDetailPage />
          }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.templateManagement' />,
        children: [
          {
            path: 'template-management/card-templates',
            element: <CardTemplatesPage />
          },
          {
            path: 'template-management/flower-mockups',
            element: <FlowerMockupsPage />
          }
        ]
      },
      {
        element: <FeatureFlagGuardLayout requires='custom.cardConfiguration' />,
        children: [
          {
            path: 'card-configuration/sizes',
            element: <CardSizesPage />
          },
          {
            path: 'card-configuration/handwriting-surcharge',
            element: <HandwritingSurchargePage />
          }
        ]
      }
    ]
  }
]
