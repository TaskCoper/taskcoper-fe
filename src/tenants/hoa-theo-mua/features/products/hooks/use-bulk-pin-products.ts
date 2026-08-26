import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { mapWithConcurrency } from '@/shared/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { MembershipUnavailableError, ensureCategoryMembership } from '../category-membership'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import { isNormalized, renumber, resolveAppendPositions, type PinnedScopeVariables } from '../reorder-utils'
import productService from '../services'
import type { PinnedProduct } from '../types'

/** Parallel `pin` + `move` pairs in flight. Keeps a 50-product batch off the socket ceiling. */
const PIN_CONCURRENCY = 4

/** A picked catalog row, carrying just enough to paint its card before the server answers. */
export type BulkPinCandidate = Omit<PinnedProduct, 'position'>

export interface BulkPinInput {
  candidates: BulkPinCandidate[]
  /**
   * Selected products that aren't members of the target category yet. The pin endpoint writes the
   * product ↔ category junction row, so membership has to exist first.
   */
  assignProductIds?: string[]
}

export interface BulkPinResult {
  succeeded: string[]
  failed: string[]
}

/**
 * Pin a whole selection into one scope in a single user action, appended in the order picked.
 *
 * Reads the scope's pinned list **once** for the whole batch (the per-product pin flow re-reads it
 * every time), repairs degenerate positions up front so "append" genuinely means last, then settles
 * every pin independently - one rejected product doesn't abandon the rest of the batch.
 */
export const useBulkPinProducts = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const queryKey = productKeys.pinned(categoryId)
  const mutationKey = productKeys.pinnedMutation(categoryId)

  const { mutate, isPending: isBulkPinningProducts } = useMutation({
    mutationKey,
    scope: { id: productKeys.pinnedScope(categoryId) },

    mutationFn: async ({
      candidates,
      assignProductIds
    }: PinnedScopeVariables & BulkPinInput): Promise<BulkPinResult> => {
      if (categoryId && assignProductIds?.length) {
        await ensureCategoryMembership(queryClient, categoryId, assignProductIds)
      }

      // The authoritative list for position maths - the cache may be mid-optimistic-write.
      const pinned = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => productService.getPinnedProducts({ categoryId })
      })

      let tail = pinned
      if (!isNormalized(pinned)) {
        const plan = renumber(pinned)
        await Promise.all(plan.updates.map((update) => productService.moveProduct({ ...update, categoryId })))
        tail = plan.items
      }

      const positions = resolveAppendPositions(tail, candidates.length)

      const settled = await mapWithConcurrency(candidates, PIN_CONCURRENCY, async (candidate, index) => {
        await productService.pinProduct({ body: { productId: candidate.productId, isPin: true, categoryId } })
        await productService.moveProduct({ id: candidate.productId, position: positions[index], categoryId })

        return candidate.productId
      })

      return {
        succeeded: settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : [])),
        failed: candidates.flatMap((candidate, index) =>
          settled[index].status === 'rejected' ? [candidate.productId] : []
        )
      }
    },

    onMutate: async ({ candidates }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PinnedProduct[]>(queryKey)

      const positions = resolveAppendPositions(previous ?? [], candidates.length)
      queryClient.setQueryData<PinnedProduct[]>(queryKey, [
        ...(previous ?? []),
        ...candidates.map((candidate, index) => ({ ...candidate, position: positions[index] }))
      ])

      return { previous }
    },

    onSuccess: ({ succeeded, failed }) => {
      if (failed.length === 0) {
        toast.success(t('products.pinned.add.success', { count: succeeded.length }))
        return
      }

      // Partial batches are *not* rolled back - the products that landed are genuinely pinned.
      toast.warning(
        t('products.pinned.add.partial', {
          succeeded: succeeded.length,
          total: succeeded.length + failed.length,
          failed: failed.length
        })
      )
    },

    onError: (error, _variables, context) => {
      if (context?.previous && queryClient.isMutating({ mutationKey }) <= 1) {
        queryClient.setQueryData(queryKey, context.previous)
      }

      if (error instanceof MembershipUnavailableError) {
        toast.error(t('products.pinned.add.membershipFailed'))
        return
      }

      toast.error(t('error.somethingWentWrong'), {
        description: isAxiosError(error) ? getErrorDescription(error.response?.data) : undefined
      })
    },

    onSettled: (_data, _error, { candidates }) => {
      candidates.forEach((candidate) =>
        queryClient.invalidateQueries({ queryKey: productKeys.detail(candidate.productId) })
      )
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.listsInfinite() })

      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ['categoryProduct', categoryId] })
        queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
      }

      if (queryClient.isMutating({ mutationKey }) > 1) return
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const bulkPinProducts = useCallback(
    (input: BulkPinInput, options?: { onSuccess?: (result: BulkPinResult) => void }) =>
      mutate(
        { ...input, pendingIds: input.candidates.map((candidate) => candidate.productId) },
        { onSuccess: options?.onSuccess }
      ),
    [mutate]
  )

  return { bulkPinProducts, isBulkPinningProducts }
}
