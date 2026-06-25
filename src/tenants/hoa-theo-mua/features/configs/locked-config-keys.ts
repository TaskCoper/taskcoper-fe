export const LOCKED_ASYNC_CONFIG_KEYS = {
  defaultDepot: 'nhanhvn.default_depot',
  orderTags: 'nhanhvn.order_tags'
} as const

export const LOCKED_ASYNC_KEY_SET: ReadonlySet<string> = new Set(Object.values(LOCKED_ASYNC_CONFIG_KEYS))

export const isLockedAsyncConfigKey = (key: string | undefined): boolean => !!key && LOCKED_ASYNC_KEY_SET.has(key)
