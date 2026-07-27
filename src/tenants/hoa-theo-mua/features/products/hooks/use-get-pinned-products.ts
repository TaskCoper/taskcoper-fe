import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'

/**
 * Pinned products for a scope. No `categoryId` → the global (Product-level) pin list; a `categoryId`
 * → that category's junction pin list. The key includes `categoryId` so the scopes never share a
 * cache entry, and the closure `queryFn` forwards it (a bare service reference would receive React
 * Query's context object and send `CategoryId=undefined`).
 */
export const useGetPinnedProducts = (categoryId?: string) => {
  const { data: pinnedProducts, isLoading: isGettingPinnedProducts } = useQuery({
    queryKey: productKeys.pinned(categoryId),
    queryFn: () => productService.getPinnedProducts({ categoryId })
  })

  return { pinnedProducts, isGettingPinnedProducts }
}
