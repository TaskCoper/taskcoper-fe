import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import productService from '../services'
import { resolveAppendPosition } from '../utils'

/** One pin/unpin change for a product in a single scope. `categoryId` absent → the global target. */
export interface PinTargetChange {
  categoryId?: string
  isPin: boolean
}

/**
 * Apply a batch of pin/unpin changes for one product across scopes (global + any categories). Each
 * change hits `PUT /v1/products/pin` with its own `categoryId` (or none), so one dialog can pin the
 * product to several places and unpin it from others at once. Newly-pinned targets are appended to
 * the end of their scope's list so positions stay distinct. One invalidation on settle.
 */
export const useUpdateProductPins = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: updateProductPins, isPending: isUpdatingProductPins } = useMutation({
    mutationFn: async ({ productId, changes }: { productId: string; changes: PinTargetChange[] }) => {
      // Sequential so each scope's append-position read reflects the pin that just landed.
      for (const change of changes) {
        await productService.pinProduct({ body: { productId, isPin: change.isPin, categoryId: change.categoryId } })
        if (!change.isPin) continue

        try {
          const pinned = await queryClient.fetchQuery({
            queryKey: productKeys.pinned(change.categoryId),
            queryFn: () => productService.getPinnedProducts({ categoryId: change.categoryId })
          })
          const position = resolveAppendPosition(pinned, productId)
          if (position !== null) {
            await productService.moveProduct({ id: productId, position, categoryId: change.categoryId })
          }
        } catch {
          // Couldn't resolve the scope's list — leave the server default; a later drag re-numbers cleanly.
        }
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

  return { updateProductPins, isUpdatingProductPins }
}
