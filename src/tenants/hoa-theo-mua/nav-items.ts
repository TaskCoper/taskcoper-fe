import type { TenantNavMainItem, TenantNavQuickActionItem } from '@/lib/feature-flags/tenant-nav-items'
import { BriefcaseIcon, FlowerIcon, MapPinIcon, NewspaperIcon, PackageIcon, SettingsIcon } from 'lucide-react'
import { HOA_THEO_MUA_ROUTE_PREFIX } from './config'

export const hoaTheoMuaNavMain: TenantNavMainItem[] = [
  {
    titleKey: 'navigation.orders.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`,
    icon: PackageIcon,
    feature: 'custom.orderManagement',
    items: [
      // {
      //   titleKey: 'navigation.orders.dashboard',
      //   url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`,
      //   activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`]
      // },
      {
        titleKey: 'navigation.orders.list',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`, `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/:orderId`],
        activeExcludePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`
        ]
      }
      // {
      //   titleKey: 'navigation.orders.customers',
      //   url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`,
      //   activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`]
      // }
    ]
  },
  {
    titleKey: 'navigation.products.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/products`,
    icon: FlowerIcon,
    feature: 'custom.productManagement',
    items: [
      {
        titleKey: 'navigation.products.list',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/products`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/products`],
        activeExcludePatterns: []
      }
    ]
  },
  {
    titleKey: 'navigation.recruitment.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`,
    icon: BriefcaseIcon,
    feature: 'custom.recruitmentPortal',
    items: [
      {
        titleKey: 'navigation.recruitment.jobs',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`],
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/applicants`]
      },
      {
        titleKey: 'navigation.recruitment.create',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/create`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/create`]
      },
      {
        titleKey: 'navigation.recruitment.applicants',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/applicants`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment/applicants`]
      }
    ]
  },
  {
    titleKey: 'navigation.addresses.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses`,
    icon: MapPinIcon,
    feature: 'custom.addressManagement',
    items: [
      {
        titleKey: 'navigation.addresses.list',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses`],
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses/zones`]
      }
      // {
      //   titleKey: 'navigation.addresses.zones',
      //   url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses/zones`,
      //   activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/addresses/zones`]
      // }
    ]
  },
  {
    titleKey: 'navigation.news.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news`,
    icon: NewspaperIcon,
    feature: 'custom.customNewsPage',
    items: [
      {
        titleKey: 'navigation.news.articles',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/news/`],
        activeExcludePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/news/categories`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/news/add`
        ]
      },
      {
        titleKey: 'navigation.news.categories',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news/categories`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/news/categories`]
      },
      {
        titleKey: 'navigation.news.add',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/news/add`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/news/add`]
      }
    ]
  }
]

export const hoaTheoMuaNavQuickActions: TenantNavQuickActionItem[] = [
  {
    titleKey: 'navigation.systemConfigs',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/configs`,
    icon: SettingsIcon,
    activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs`],
    feature: 'module.taskManagement'
  }
]
