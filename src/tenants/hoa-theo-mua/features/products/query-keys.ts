import type { GetProductsParams } from './hooks/use-get-products'

export const productKeys = {
  all: ['products'] as const,
  /** Prefix matching every paginated catalog page - narrow enough to leave the pinned lists alone. */
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: GetProductsParams) => [...productKeys.lists(), params] as const,
  listsInfinite: () => [...productKeys.all, 'list-infinite'] as const,
  listInfinite: (params: GetProductsParams) => [...productKeys.listsInfinite(), params] as const,
  maxPrice: (categoryId?: string | null) => [...productKeys.all, 'max-price', categoryId ?? null] as const,
  pinnedRoot: () => [...productKeys.all, 'pinned'] as const,
  pinned: (categoryId?: string | null) => [...productKeys.pinnedRoot(), categoryId ?? null] as const,
  pinnedMutation: (categoryId?: string | null) => [...productKeys.pinned(categoryId), 'mutation'] as const,
  pinnedScope: (categoryId?: string | null) => `pinned-${categoryId ?? 'global'}`,
  pinUpdate: () => [...productKeys.all, 'pin-update'] as const,
  detail: (id: string | number) => [...productKeys.all, 'detail', String(id)] as const
}
