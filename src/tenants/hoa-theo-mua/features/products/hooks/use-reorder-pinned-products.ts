import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import type { PinnedReorderPlan, PinnedScopeVariables } from '../reorder-utils'
import productService from '../services'
import type { PinnedProduct } from '../types'

export type { PinnedPositionUpdate } from '../reorder-utils'

/**
 * Persist a reorder plan for one pinned scope.
 *
 * The plan comes from `planMove` / `planInsert`, which mint a single position in the common case, so
 * an ordinary drag costs **one** `move` PUT rather than re-numbering the whole scope. A full
 * re-number only happens when the server data is degenerate (duplicate / null positions) or the
 * neighbours have no integer between them - and it repairs the scope permanently.
 *
 * The optimistic cache write does **not** happen in here. A `useMutation`'s `onMutate` is always
 * reached through `mutate()`'s internal `async execute()`, which awaits at least one prior hook
 * before calling ours - so the write lands one React-scheduler tick after the event that triggered
 * it, in its own render. On a drag, that's a tick *after* dnd-kit has already reset the dragged
 * card's transform, so the card visibly snaps back to its old slot for a frame before jumping to the
 * new one. `usePinnedBoard` writes the plan into the cache itself, synchronously, inside the same
 * `onDragEnd`/menu-action call stack that ends the drag - this mutation only persists it over the
 * network and rolls the snapshot back on failure.
 */
export const useReorderPinnedProducts = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const queryKey = productKeys.pinned(categoryId)
  const mutationKey = productKeys.pinnedMutation(categoryId)

  const { mutate, isPending: isReorderingPinnedProducts } = useMutation({
    mutationKey,
    // Serialises the *network* calls for this scope so rapid drags queue instead of racing.
    scope: { id: productKeys.pinnedScope(categoryId) },
    mutationFn: ({ plan }: PinnedScopeVariables & { plan: PinnedReorderPlan; previous?: PinnedProduct[] }) =>
      Promise.all(plan.updates.map((update) => productService.moveProduct({ ...update, categoryId }))),

    onError: (error, variables) => {
      // With several drags queued an older snapshot would clobber a newer optimistic state, so only
      // the last writer standing rolls back; otherwise `onSettled`'s invalidate resyncs from the
      // server. A mutation is still counted as pending inside its own callbacks, hence `<= 1`.
      if (variables.previous && queryClient.isMutating({ mutationKey }) <= 1) {
        queryClient.setQueryData(queryKey, variables.previous)
      }

      toast.error(t('products.pinned.reorder.failed'), {
        description: getErrorDescription(error.response?.data)
      })
    },

    onSettled: () => {
      // Refetching while another write on this scope is in flight would overwrite its optimistic
      // state with a server list that doesn't include it yet - the "order snaps back" bug.
      if (queryClient.isMutating({ mutationKey }) > 1) return
      queryClient.invalidateQueries({ queryKey })
    }
  })

  /**
   * Callers pass the plan plus the pre-write snapshot (for rollback) - both belong to the eager
   * cache write the caller already made. `pendingIds` is derived here so only the moved cards show a
   * spinner.
   */
  const reorderPinnedProducts = useCallback(
    (plan: PinnedReorderPlan, previous?: PinnedProduct[]) =>
      mutate({ plan, previous, pendingIds: plan.updates.map((update) => update.id) }),
    [mutate]
  )

  return { reorderPinnedProducts, isReorderingPinnedProducts }
}
