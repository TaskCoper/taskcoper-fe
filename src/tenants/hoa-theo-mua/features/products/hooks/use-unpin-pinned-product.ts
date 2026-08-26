import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import { planInsert, resolveRestoreIndex, type PinnedReorderPlan, type PinnedScopeVariables } from '../reorder-utils'
import productService from '../services'
import type { PinnedProduct } from '../types'

const UNDO_TOAST_DURATION = 8000

/**
 * Unpin a product from one scope, reversibly.
 *
 * Unpinning is a single click on a card the user is constantly mousing over, and re-pinning it the
 * long way round costs a trip to the catalog table *and* loses the product's place in the order. So
 * every unpin snapshots the list and offers an 8-second undo that restores the pin **and** the slot.
 */
export const useUnpinPinnedProduct = (categoryId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const queryKey = productKeys.pinned(categoryId)
  const mutationKey = productKeys.pinnedMutation(categoryId)
  const scope = { id: productKeys.pinnedScope(categoryId) }

  const productName = useCallback(
    (product: PinnedProduct) => product.productName?.trim() || t('products.common.unnamed'),
    [t]
  )

  const { mutate: restore } = useMutation({
    mutationKey,
    scope,
    mutationFn: async ({
      product,
      plan
    }: PinnedScopeVariables & { product: PinnedProduct; plan: PinnedReorderPlan }) => {
      await productService.pinProduct({ body: { productId: product.productId, isPin: true, categoryId } })
      await Promise.all(plan.updates.map((update) => productService.moveProduct({ ...update, categoryId })))
    },

    onMutate: async ({ plan }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PinnedProduct[]>(queryKey)
      queryClient.setQueryData<PinnedProduct[]>(queryKey, plan.items)

      return { previous }
    },

    onSuccess: (_data, { product }) => {
      toast.success(t('products.pinned.unpin.undone', { name: productName(product) }))
    },

    onError: (error, _variables, context) => {
      if (context?.previous && queryClient.isMutating({ mutationKey }) <= 1) {
        queryClient.setQueryData(queryKey, context.previous)
      }

      toast.error(t('products.pinned.unpin.undoFailed'), {
        description: getErrorDescription(error.response?.data)
      })
    },

    onSettled: () => {
      if (queryClient.isMutating({ mutationKey }) > 1) return
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const { mutate: unpin } = useMutation({
    mutationKey,
    scope,
    mutationFn: ({ product }: PinnedScopeVariables & { product: PinnedProduct }) =>
      productService.pinProduct({ body: { productId: product.productId, isPin: false, categoryId } }),

    onMutate: async ({ product }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PinnedProduct[]>(queryKey)
      queryClient.setQueryData<PinnedProduct[]>(queryKey, (old) =>
        old?.filter((item) => item.productId !== product.productId)
      )

      return { previous }
    },

    onSuccess: (_data, { product }, context) => {
      const snapshot = context?.previous ?? []

      toast.success(t('products.pinned.unpin.success', { name: productName(product) }), {
        duration: UNDO_TOAST_DURATION,
        action: {
          label: t('products.pinned.unpin.undo'),
          onClick: () => {
            // Plan against the list as it stands *when undo is clicked*, not when the unpin happened:
            // the user may have dragged other cards or unpinned something else in between. The
            // snapshot only supplies the neighbours that decide where the card belongs.
            const current = (queryClient.getQueryData<PinnedProduct[]>(queryKey) ?? []).filter(
              (item) => item.productId !== product.productId
            )
            const plan = planInsert(current, product, resolveRestoreIndex(current, snapshot, product.productId))

            restore({ product, plan, pendingIds: [product.productId] })
          }
        }
      })
    },

    onError: (error, _variables, context) => {
      if (context?.previous && queryClient.isMutating({ mutationKey }) <= 1) {
        queryClient.setQueryData(queryKey, context.previous)
      }

      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },

    onSettled: (_data, _error, { product }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(product.productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })

      if (queryClient.isMutating({ mutationKey }) > 1) return
      queryClient.invalidateQueries({ queryKey })
    }
  })

  const unpinPinnedProduct = useCallback(
    (product: PinnedProduct) => unpin({ product, pendingIds: [product.productId] }),
    [unpin]
  )

  return { unpinPinnedProduct }
}
