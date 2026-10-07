import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { getApiErrorDetail } from '../api-error'
import { marketingPostKeys } from '../query-keys'
import marketingPostService from '../services'
import { isPublishingStatus } from '../types'

interface DeleteMarketingPostParams {
  onDeleteSuccess?: () => void
}

// Chỉ xoá được bài chưa đăng. Danh sách không trả trạng thái nền tảng nên lúc bấm xoá phải đọc
// lại chi tiết mới biết - đọc mới hẳn chứ không tin cache, bài có thể vừa được đăng ở tab khác.
export const useDeleteMarketingPost = ({ onDeleteSuccess }: DeleteMarketingPostParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()

  const { mutate, isPending: isDeletingMarketingPost } = useMutation({
    mutationFn: marketingPostService.deleteMarketingPost,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      toast.success(t('marketingPosts.studio.discardSuccess'))
      // Rời trang chi tiết trước rồi mới bỏ cache, không thì nó kịp hỏi lại và nháy "không tìm thấy"
      onDeleteSuccess?.()
      queryClient.removeQueries({ queryKey: marketingPostKeys.detail(id) })
    },
    onError: (error, { id }) => {
      // Backend chặn thì thường là bài vừa đổi trạng thái - đọc lại cho màn hình khớp
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.detail(id) })
      toast.error(t('marketingPosts.delete.error'), { description: getApiErrorDetail(error) })
    }
  })

  const deleteMarketingPost = useCallback(
    async (id: string) => {
      const post = await queryClient
        .fetchQuery({
          queryKey: marketingPostKeys.detail(id),
          queryFn: () => marketingPostService.getMarketingPost({ id }),
          staleTime: 0
        })
        .catch((error) => {
          toast.error(t('marketingPosts.delete.error'), { description: getApiErrorDetail(error) })

          return null
        })

      if (!post) return

      if (post.platforms.some((platform) => isPublishingStatus(platform.status))) {
        toast.error(t('marketingPosts.delete.published'))

        return
      }

      const isConfirmed = await confirm({
        title: t('marketingPosts.delete.title'),
        description: t('marketingPosts.delete.description', { title: post.title }),
        confirmText: t('common.button.delete'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (!isConfirmed) return

      mutate({ id })
    },
    [queryClient, confirm, mutate, t]
  )

  return { deleteMarketingPost, isDeletingMarketingPost }
}
