import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { MembershipUnavailableError, ensureCategoryMembership } from '../category-membership'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import type { PinnedScopeVariables } from '../reorder-utils'
import productService from '../services'
import type { PinnedProduct } from '../types'

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

export const useBulkPinProducts = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const queryKey = productKeys.pinned(categoryId)
  const mutationKey = productKeys.pinnedMutation(categoryId)

  const { mutate, isPending: isBulkPinningProducts } = useMutation({
    mutationKey,
    scope: { id: productKeys.pinnedScope(categoryId) },

    mutationFn: async ({ candidates, assignProductIds }: PinnedScopeVariables & BulkPinInput) => {
      if (categoryId && assignProductIds?.length) {
        await ensureCategoryMembership(queryClient, categoryId, assignProductIds)
      }

      return productService.pinProducts({ productIds: candidates.map((candidate) => candidate.productId), categoryId })
    },

    onMutate: async ({ candidates }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PinnedProduct[]>(queryKey)

      queryClient.setQueryData<PinnedProduct[]>(queryKey, [
        ...(previous ?? []),
        ...candidates.map((candidate) => ({ ...candidate, position: null }))
      ])

      return { previous }
    },

    onSuccess: (_data, { candidates }) => {
      toast.success(t('products.pinned.add.success', { count: candidates.length }))
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
    (input: BulkPinInput, options?: { onSuccess?: () => void }) =>
      mutate(
        { ...input, pendingIds: input.candidates.map((candidate) => candidate.productId) },
        { onSuccess: options?.onSuccess }
      ),
    [mutate]
  )

  return { bulkPinProducts, isBulkPinningProducts }
}
