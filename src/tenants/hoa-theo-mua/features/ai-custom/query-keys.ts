import type { GetAiCardHistoryParams } from './types'

export const aiCardKeys = {
  all: ['ai-cards'] as const,
  lists: () => [...aiCardKeys.all, 'list'] as const,
  list: (params: GetAiCardHistoryParams) => [...aiCardKeys.lists(), params] as const,
  details: () => [...aiCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiCardKeys.details(), id] as const
}
