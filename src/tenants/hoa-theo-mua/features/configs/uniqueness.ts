import type { Config } from './types'

// logic thuần để các form/dialog tạo config mới có thể kiểm tra "suffix này đã dùng chưa" một cách an toàn,
// tránh race condition khi dữ liệu đang load hoặc lỗi.

export type SuffixRegistry =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; taken: ReadonlySet<string> }

export const SUFFIX_REGISTRY_LOADING: SuffixRegistry = { status: 'loading' }
export const SUFFIX_REGISTRY_ERROR: SuffixRegistry = { status: 'error' }

/** True only when the registry is known-complete AND the suffix is already used. */
export const isSuffixTaken = (registry: SuffixRegistry, suffix: string): boolean =>
  registry.status === 'ready' && registry.taken.has(suffix)

/**
 * Whether a NEW record may be created. Editing an existing record is always allowed: its suffix
 * is locked, so no uniqueness question arises.
 */
export const canCreateWithRegistry = (registry: SuffixRegistry): boolean => registry.status === 'ready'

/**
 * Builds a registry from a query's state. `configs === undefined` means the request has not
 * succeeded, which is never treated as an empty list.
 */
export const buildSuffixRegistry = ({
  configs,
  isError,
  matches,
  suffixOf
}: {
  configs: Config[] | undefined
  isError: boolean
  matches: (config: Config) => boolean
  suffixOf: (key: string) => string
}): SuffixRegistry => {
  if (isError) return SUFFIX_REGISTRY_ERROR
  if (!configs) return SUFFIX_REGISTRY_LOADING
  return { status: 'ready', taken: new Set(configs.filter(matches).map((config) => suffixOf(config.key))) }
}
