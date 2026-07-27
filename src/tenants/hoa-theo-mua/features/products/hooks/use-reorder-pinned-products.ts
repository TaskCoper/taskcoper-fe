import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
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
export const useReorderPinnedProducts = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: reorderPinnedProducts, isPending: isReorderingPinnedProducts } = useMutation({
    // Same scope switch as a single move: `categoryId` (or its absence) selects the position pair.
    mutationFn: (updates: PinnedPositionUpdate[]) =>
      Promise.all(updates.map((update) => productService.moveProduct({ ...update, categoryId }))),
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.pinnedRoot() })
    }
  })

  return { reorderPinnedProducts, isReorderingPinnedProducts }
}
