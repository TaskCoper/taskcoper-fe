import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import articleService from '../services'

interface DeleteArticlesParams {
  onDeleteSuccess?: () => void
}

export const useDeleteArticles = ({ onDeleteSuccess }: DeleteArticlesParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: deleteArticle, isPending: isDeletingArticle } = useMutation({
    mutationFn: articleService.deleteArticle,
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSuccess: (message) => {
      toast.success(message)
      onDeleteSuccess?.()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    }
  })

  return { deleteArticle, isDeletingArticle }
}
