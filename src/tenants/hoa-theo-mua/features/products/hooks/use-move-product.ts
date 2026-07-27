import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import productService from '../services'

/**
 * Persist a reordered pinned product. The optimistic reordering is done at drag time
 * (see the page's drag handler); this hook just persists and re-syncs on settle so the
 * grid settles into the server's canonical order.
 */
export const useMoveProduct = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const {
    mutate: moveProduct,
    isPending: isMovingProduct,
    variables: movingVariables
  } = useMutation({
    mutationFn: productService.moveProduct,
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'pinned'] })
    }
  })

  // The product currently being moved — lets callers reflect a per-item pending state.
  const movingProductId = isMovingProduct ? movingVariables?.id : null

  return { moveProduct, isMovingProduct, movingProductId }
}
