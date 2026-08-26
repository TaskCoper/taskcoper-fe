import type { GetProductsParams } from './hooks/use-get-products'

export const productKeys = {
  all: ['products'] as const,

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

  detailsRoot: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...productKeys.detailsRoot(), String(id)] as const,

  comboSpecificationsRoot: () => [...productKeys.all, 'combo-specification'] as const,
  comboSpecification: (id: string | number) => [...productKeys.comboSpecificationsRoot(), String(id)] as const
}