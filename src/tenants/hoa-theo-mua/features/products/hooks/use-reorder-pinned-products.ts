import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import type { PinnedReorderPlan, PinnedScopeVariables } from '../reorder-utils'
import productService from '../services'
import type { PinnedProduct } from '../types'

/**
 * Lưu một reorder plan cho một pinned scope: mỗi lần kéo là một request `move` kèm mốc
 * (`afterProductId` / `beforeProductId`), BE tự tính position.
 *
 * Optimistic update KHÔNG nằm ở đây. `onMutate` của `useMutation` luôn chạy sau ít nhất một tick của
 * React scheduler, tức là sau khi dnd-kit đã reset transform của card đang kéo, nên card sẽ giật về
 * chỗ cũ một frame rồi mới nhảy sang chỗ mới. `usePinnedBoard` tự ghi plan vào cache một cách đồng bộ
 * ngay trong `onDragEnd` / menu action; mutation này chỉ gọi API và rollback snapshot khi lỗi.
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
      productService.moveProduct({ id: plan.productId, categoryId, ...plan.anchor }),

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

  const reorderPinnedProducts = useCallback(
    (plan: PinnedReorderPlan, previous?: PinnedProduct[]) => mutate({ plan, previous, pendingIds: [plan.productId] }),
    [mutate]
  )

  return { reorderPinnedProducts, isReorderingPinnedProducts }
}
