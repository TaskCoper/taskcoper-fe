import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import productService from '../services'
import { resolveAppendPosition } from '../utils'
import { useMoveProduct } from './use-move-product'

/**
 * Pin/unpin a product within a scope. No `categoryId` → the global (Product-level) pin flag; a
 * `categoryId` → the junction (product ↔ category) pin flag. Callers pass only
 * `{ body: { productId, isPin } }`; the scope is injected here into the request, the append-position
 * computation, and the invalidation.
 */
export const usePinProduct = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()
  const { moveProduct, isMovingProduct, movingProductId } = useMoveProduct(categoryId)

  const {
    mutate: pinProduct,
    isPending: isPinning,
    variables: pinningVariables
  } = useMutation({
    mutationFn: ({ body }: { body: { productId: string; isPin: boolean } }) =>
      productService.pinProduct({ body: { ...body, categoryId } }),
    onSuccess: async (_data, { body }) => {
      // Only a pin needs a position; unpinning drops it from the list entirely.
      if (!body.isPin) return

      try {
        // Pull the real pinned list for this scope rather than the local cache: when pinning from the
        // catalog table the pinned query isn't mounted, so its cache is empty and appending against it
        // would hand every new pin the same INITIAL_POSITION (duplicate positions break ordering).
        const pinned = await queryClient.fetchQuery({
          queryKey: productKeys.pinned(categoryId),
          queryFn: () => productService.getPinnedProducts({ categoryId })
        })

        // Append after every *other* product. No others → it's the only pin, default position is fine.
        const position = resolveAppendPosition(pinned, body.productId)
        if (position === null) return

        moveProduct({ id: body.productId, position })
      } catch {
        // Couldn't resolve the current list — leave the server default; a later drag re-numbers cleanly.
      }
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    }
  })

  const isPinningProduct = isPinning || isMovingProduct
  const pinningProductId = (isPinning ? pinningVariables?.body.productId : null) ?? movingProductId ?? null

  return { pinProduct, isPinningProduct, pinningProductId }
}
