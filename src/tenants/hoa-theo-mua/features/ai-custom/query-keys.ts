import type {
  GetAiCardHistoryParams,
  GetAiFlowerDesignComboOptionsParams,
  GetAiFlowerDesignHistoryParams
} from './types'

export const aiCardKeys = {
  all: ['ai-cards'] as const,
  lists: () => [...aiCardKeys.all, 'list'] as const,
  list: (params: GetAiCardHistoryParams) => [...aiCardKeys.lists(), params] as const,
  details: () => [...aiCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiCardKeys.details(), id] as const
}

export const aiFlowerDesignKeys = {
  all: ['ai-flower-designs', 'mock-v3'] as const,
  lists: () => [...aiFlowerDesignKeys.all, 'list'] as const,
  list: (params: GetAiFlowerDesignHistoryParams) => [...aiFlowerDesignKeys.lists(), params] as const,
  comboOptions: (params: GetAiFlowerDesignComboOptionsParams) =>
    [...aiFlowerDesignKeys.all, 'combo-options', params] as const,
  details: () => [...aiFlowerDesignKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiFlowerDesignKeys.details(), id] as const
}
