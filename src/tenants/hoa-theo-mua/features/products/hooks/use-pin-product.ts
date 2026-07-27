import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { calculateReorderPosition } from '@/shared/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import productService from '../services'
import { useMoveProduct } from './use-move-product'

export const usePinProduct = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()
  const { moveProduct, isMovingProduct, movingProductId } = useMoveProduct()

  const {
    mutate: pinProduct,
    isPending: isPinning,
    variables: pinningVariables
  } = useMutation({
    mutationFn: productService.pinProduct,
    onSuccess: async (_data, { body }) => {
      // Only a pin needs a position; unpinning drops it from the list entirely.
      if (!body.isPin) return

      try {
        // Pull the real pinned list rather than the local cache: when pinning from the catalog table
        // the pinned query isn't mounted, so its cache is empty and appending against it would hand
        // every new pin the same INITIAL_POSITION (duplicate positions break ordering).
        const pinned = await queryClient.fetchQuery({
          queryKey: ['products', 'pinned'],
          queryFn: productService.getPinnedProducts
        })

        // Append after every *other* product (the just-pinned one is already in the list, at the
        // server default). No others → it's the only pin, so the default position is fine as-is.
        const others = pinned.filter((product) => product.productId !== body.productId)
        if (others.length === 0) return

        const sorted = [...others].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        const position = calculateReorderPosition(
          sorted.map((product) => ({ position: product.position ?? 0 })),
          sorted.length
        )

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
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const isPinningProduct = isPinning || isMovingProduct
  const pinningProductId = (isPinning ? pinningVariables?.body.productId : null) ?? movingProductId ?? null

  return { pinProduct, isPinningProduct, pinningProductId }
}
