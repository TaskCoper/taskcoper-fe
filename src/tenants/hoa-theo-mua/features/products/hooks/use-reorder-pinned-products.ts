import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import productService from '../services'

export interface PinnedPositionUpdate {
  id: string
  position: number
}

/**
 * Persist a batch of pinned-product positions in one shot — parallel `move` PUTs behind a single
 * mutation, with one invalidation on settle.
 *
 * The drag handler re-numbers the whole list to clean, evenly-spaced positions rather than nudging
 * a single card: the server data can hold duplicate positions (many items share `INITIAL_POSITION`),
 * and a fractional midpoint can't produce a value strictly between two equal positions. A full
 * re-number keeps ordering unambiguous and repairs the degenerate data on the first drag.
 */
export const useReorderPinnedProducts = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: reorderPinnedProducts, isPending: isReorderingPinnedProducts } = useMutation({
    mutationFn: (updates: PinnedPositionUpdate[]) =>
      Promise.all(updates.map((update) => productService.moveProduct(update))),
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'pinned'] })
    }
  })

  return { reorderPinnedProducts, isReorderingPinnedProducts }
}
