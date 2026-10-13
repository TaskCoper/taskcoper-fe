import type { TenantNavMainItem, TenantNavQuickActionItem } from '@/lib/feature-flags/tenant-nav-items'
import {
  BriefcaseIcon,
  FlowerIcon,
  FolderTreeIcon,
  LayoutTemplateIcon,
  MapPinIcon,
  MegaphoneIcon,
  NewspaperIcon,
  PackageIcon,
  SettingsIcon,
  SparklesIcon,
  TicketPercentIcon
} from 'lucide-react'
import { HOA_THEO_MUA_ROUTE_PREFIX } from './config'

// activePatterns: URL nào thì mục này sáng đèn (match kiểu chính xác)
// activeExcludePatterns: URL nào thì KHÔNG được sáng đèn, dù có khớp activePatterns ở trên (check trước, ưu tiên hơn)
// Lưu ý: pattern có dạng /products/:id sẽ khớp với MỌI đường dẫn con, ví dụ /products/pinned, /products/categories...
// nên route con nào có menu riêng thì phải thêm vào activeExcludePatterns của route cha, không thì 2 mục cùng sáng đèn 1 lúc

export const hoaTheoMuaNavMain: TenantNavMainItem[] = [
  {
    titleKey: 'navigation.orders.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`,
    icon: PackageIcon,
    feature: 'custom.orderManagement',
    items: [
      {
        titleKey: 'navigation.orders.list',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`, `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/:orderId`],
        activeExcludePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/dashboard`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/orders/customers`
        ]
      },
      {
        titleKey: 'navigation.orders.system',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders`]
      }
    ]
  },
  {
    titleKey: 'navigation.vouchers',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers`,
    icon: TicketPercentIcon,
    feature: 'custom.systemConfigs',
    items: [
      {
        titleKey: 'configsPage.vouchers.list',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers`],
        activeExcludePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs/:programId`
        ]
      },
      {
        titleKey: 'configsPage.vouchers.programs',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs`,
        activePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs/:programId`
        ]
      }
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
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/products`, `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/:id`],
        // /products/:id khớp cả /products/pinned và /products/categories nên phải loại 2 cái này ra
        activeExcludePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/pinned`
        ]
      },
      {
        titleKey: 'navigation.products.pinned',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/pinned`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/pinned`]
      }
    ]
  },
  {
    titleKey: 'navigation.categories.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories`,
    icon: FolderTreeIcon,
    feature: 'custom.productManagement',
    items: [
      {
        titleKey: 'navigation.categories.list',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories`],
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories/sort`]
      },
      {
        titleKey: 'navigation.categories.sort',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories/sort`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/categories/sort`]
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
  },
  {
    titleKey: 'navigation.aiCustom.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards`,
    icon: SparklesIcon,
    feature: 'custom.aiCustom',
    items: [
      {
        titleKey: 'navigation.aiCustom.cards',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards`,
        activePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards/:id`
        ]
      },
      {
        titleKey: 'navigation.aiCustom.flowerDesigns',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/flower-designs`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/flower-designs`]
      }
    ]
  },
  {
    titleKey: 'navigation.aiMarketing.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`,
    icon: MegaphoneIcon,
    feature: 'custom.aiMarketing',
    items: [
      {
        titleKey: 'navigation.aiMarketing.posts',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`,
        activePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/:id`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/:id/update`
        ],
        // /posts/:id khớp luôn /posts/create nên phải loại ra, không thì 2 mục cùng sáng đèn
        activeExcludePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/create`]
      },
      {
        titleKey: 'navigation.aiMarketing.create',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/create`,
        // Studio là bước hai của luồng tạo bài nên vẫn tính là đang ở mục Tạo bài đăng
        activePatterns: [
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/create`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/create/:draftId/platforms`,
          `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts/studio/:draftId`
        ]
      },
      {
        titleKey: 'navigation.aiMarketing.accounts',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/accounts`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/accounts`]
      }
    ]
  },
  {
    titleKey: 'navigation.templateManagement.title',
    url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/template-management/card-templates`,
    icon: LayoutTemplateIcon,
    feature: 'custom.templateManagement',
    items: [
      {
        titleKey: 'navigation.templateManagement.cardTemplates',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/template-management/card-templates`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/template-management/card-templates`]
      },
      {
        titleKey: 'navigation.templateManagement.flowerMockups',
        url: `/${HOA_THEO_MUA_ROUTE_PREFIX}/template-management/flower-mockups`,
        activePatterns: [`/${HOA_THEO_MUA_ROUTE_PREFIX}/template-management/flower-mockups`]
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
