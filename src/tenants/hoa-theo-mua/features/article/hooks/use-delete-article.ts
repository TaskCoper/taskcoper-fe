import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import articleService from '../services'

interface DeleteArticlesParams {
  onDeleteSuccess?: () => void
}

export const useDeleteArticle = ({ onDeleteSuccess }: DeleteArticlesParams = {}) => {
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
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      queryClient.invalidateQueries({ queryKey: ['article', variables.identifier] })
    }
  })

  return { deleteArticle, isDeletingArticle }
}
