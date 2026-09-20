import type { GetFloralMockupsParams } from './types'

export const floralMockupKeys = {
  all: ['floral-mockups', 'mock-v1'] as const,
  lists: () => [...floralMockupKeys.all, 'list'] as const,
  list: (params: GetFloralMockupsParams) => [...floralMockupKeys.lists(), params] as const
}
