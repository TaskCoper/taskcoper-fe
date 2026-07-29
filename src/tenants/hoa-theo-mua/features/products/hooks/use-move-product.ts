import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import productService from '../services'

export const useMoveProduct = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const {
    mutate: moveProduct,
    isPending: isMovingProduct,
    variables: movingVariables
  } = useMutation({
    // `categoryId` is a hook-level concern, so callers still pass just `{ id, position }`; the scope
    // is injected here and picks the Product vs junction position pair server-side.
    mutationFn: (variables: { id: string; position: number }) =>
      productService.moveProduct({ ...variables, categoryId }),
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.pinnedRoot() })
    }
  })

  // The product currently being moved — lets callers reflect a per-item pending state.
  const movingProductId = isMovingProduct ? movingVariables?.id : null

  return { moveProduct, isMovingProduct, movingProductId }
}
