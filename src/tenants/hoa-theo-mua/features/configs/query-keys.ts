import type { ConfigKind, GetConfigsParams } from './types'

export const configKeys = {
  all: ['configs'] as const,

  byKind: (kind: ConfigKind) => [...configKeys.all, kind] as const,
  list: (kind: ConfigKind, { groupName, key }: GetConfigsParams = {}) =>
    [...configKeys.byKind(kind), groupName, key] as const,

  contentList: ({ groupName, key, isPublic }: GetConfigsParams & { isPublic?: boolean } = {}) =>
    [...configKeys.byKind('content'), groupName, key, isPublic] as const,

  detail: (id?: string) => [...configKeys.all, 'detail', id] as const,
  orderTags: () => [...configKeys.all, 'order-tags'] as const
}
