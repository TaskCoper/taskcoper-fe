import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'
import type { PinnedProduct } from '../types'

/**
 * Order the scope by `position` on read instead of trusting the array order the API happens to send.
 * Server data can hold duplicate positions (many rows share `INITIAL_POSITION`) and `position` is
 * nullable, so without this a refetch can reshuffle the board. `Array.prototype.sort` is stable, so
 * ties keep server order, and nulls sort last rather than jumping to the front.
 *
 * Defined at module scope so React Query can memoise the `select` result - an inline arrow would
 * produce a new array identity on every render and defeat referential equality for consumers.
 */
const sortByPosition = (items: PinnedProduct[]) =>
  [...items].sort((a, b) => (a.position ?? Number.POSITIVE_INFINITY) - (b.position ?? Number.POSITIVE_INFINITY))

/**
 * Pinned products for a scope. No `categoryId` → the global (Product-level) pin list; a `categoryId`
 * → that category's junction pin list. The key includes `categoryId` so the scopes never share a
 * cache entry, and the closure `queryFn` forwards it (a bare service reference would receive React
 * Query's context object and send `CategoryId=undefined`).
 *
 * `isPinnedProductsError` is surfaced so a failed load can render a retry instead of the "no pins
 * yet" empty state, which would otherwise be indistinguishable from a genuinely empty scope.
 */
export const useGetPinnedProducts = (categoryId?: string) => {
  const {
    data: pinnedProducts,
    isLoading: isGettingPinnedProducts,
    isError: isPinnedProductsError,
    refetch: refetchPinnedProducts
  } = useQuery({
    queryKey: productKeys.pinned(categoryId),
    queryFn: () => productService.getPinnedProducts({ categoryId }),
    select: sortByPosition
  })

  return { pinnedProducts, isGettingPinnedProducts, isPinnedProductsError, refetchPinnedProducts }
}
