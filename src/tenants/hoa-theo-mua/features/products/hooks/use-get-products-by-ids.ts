import { useQueries } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'
import type { ProductDetail } from '../types'

/**
 * Resolves an arbitrary set of product ids to their details - for screens that hold ids (config
 * payloads, imports) and need names/images to show. Each id reuses the same cache entry as
 * `useGetProduct`, so ids already visited elsewhere resolve without another request, and an id whose
 * product was deleted simply stays unresolved instead of failing the batch.
 */
export const useGetProductsByIds = (ids: string[]) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: productKeys.detail(id),
      queryFn: () => productService.getProduct({ id }),
      // Ids come from stored payloads and may point at products that no longer exist; a 404 has to
      // leave that entry unresolved rather than bubble up to the error boundary (the global default).
      throwOnError: false
    })),
    combine: (results) => {
      const productsById: Record<string, ProductDetail> = {}
      results.forEach((result, index) => {
        if (result.data) productsById[ids[index]] = result.data
      })

      return { productsById, isGettingProductsByIds: results.some((result) => result.isLoading) }
    }
  })
}
