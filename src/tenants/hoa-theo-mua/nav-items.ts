import type { TenantNavMainItem } from '@/lib/feature-flags/tenant-nav-items'
import { BriefcaseIcon, MapPinIcon, NewspaperIcon, PackageIcon } from 'lucide-react'
import { HOA_THEO_MUA_ROUTE_PREFIX } from './routes'

export const hoaTheoMuaNavMain: TenantNavMainItem[] = [
  {
    title: 'Quản lý đơn hàng',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`,
    icon: PackageIcon,
    feature: 'custom.orderManagement',
    items: [
      {
        title: 'Tổng quan',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`]
      },
      {
        title: 'Danh sách đơn hàng',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`, `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/:orderId`],
        activeExcludePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`
        ]
      },
      {
        title: 'Khách hàng',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`]
      }
    ]
  },
  {
    title: 'Tuyển dụng',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`,
    icon: BriefcaseIcon,
    feature: 'custom.recruitmentPortal',
    items: [
      {
        title: 'Tin tuyển dụng',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`],
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/applicants`]
      },
      {
        title: 'Ứng viên',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/applicants`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/applicants`]
      }
    ]
  },
  {
    title: 'Quản lý địa chỉ',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses`,
    icon: MapPinIcon,
    feature: 'custom.addressManagement',
    items: [
      {
        title: 'Địa chỉ giao hàng',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses`],
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses/zones`]
      },
      {
        title: 'Khu vực giao hàng',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses/zones`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses/zones`]
      }
    ]
  },
  {
    title: 'Tin tức nội bộ',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news`,
    icon: NewspaperIcon,
    feature: 'custom.customNewsPage',
    items: [
      {
        title: 'Bài viết',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/news`],
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/news/categories`]
      },
      {
        title: 'Danh mục',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news/categories`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/news/categories`]
      }
    ]
  }
]
