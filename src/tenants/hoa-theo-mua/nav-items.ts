import type { TenantNavMainItem } from '@/lib/feature-flags/tenant-nav-items'
import { BriefcaseIcon, MapPinIcon, NewspaperIcon, PackageIcon } from 'lucide-react'

export const hoaTheoMuaNavMain: TenantNavMainItem[] = [
  {
    title: 'Quản lý đơn hàng',
    url: '/orders',
    icon: PackageIcon,
    feature: 'custom.orderManagement',
    items: [
      {
        title: 'Tổng quan',
        url: '/orders/dashboard',
        activePatterns: ['/orders/dashboard']
      },
      {
        title: 'Danh sách đơn hàng',
        url: '/orders',
        activePatterns: ['/orders', '/orders/:orderId'],
        activeExcludePatterns: ['/orders/dashboard', '/orders/customers']
      },
      {
        title: 'Khách hàng',
        url: '/orders/customers',
        activePatterns: ['/orders/customers']
      }
    ]
  },
  {
    title: 'Tuyển dụng',
    url: '/recruitment',
    icon: BriefcaseIcon,
    feature: 'custom.recruitmentPortal',
    items: [
      {
        title: 'Tin tuyển dụng',
        url: '/recruitment',
        activePatterns: ['/recruitment'],
        activeExcludePatterns: ['/recruitment/applicants']
      },
      {
        title: 'Ứng viên',
        url: '/recruitment/applicants',
        activePatterns: ['/recruitment/applicants']
      }
    ]
  },
  {
    title: 'Quản lý địa chỉ',
    url: '/addresses',
    icon: MapPinIcon,
    feature: 'custom.addressManagement',
    items: [
      {
        title: 'Địa chỉ giao hàng',
        url: '/addresses',
        activePatterns: ['/addresses'],
        activeExcludePatterns: ['/addresses/zones']
      },
      {
        title: 'Khu vực giao hàng',
        url: '/addresses/zones',
        activePatterns: ['/addresses/zones']
      }
    ]
  },
  {
    title: 'Tin tức nội bộ',
    url: '/custom-news',
    icon: NewspaperIcon,
    feature: 'custom.customNewsPage',
    items: [
      {
        title: 'Bài viết',
        url: '/custom-news',
        activePatterns: ['/custom-news'],
        activeExcludePatterns: ['/custom-news/categories']
      },
      {
        title: 'Danh mục',
        url: '/custom-news/categories',
        activePatterns: ['/custom-news/categories']
      }
    ]
  }
]
