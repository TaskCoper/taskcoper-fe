import type { MarketingPostPlatform } from '../marketing-posts/types'

export const platformAccountKeys = {
  all: ['platform-accounts'] as const,
  list: (platform?: MarketingPostPlatform) => [...platformAccountKeys.all, 'list', platform ?? 'all'] as const
}
