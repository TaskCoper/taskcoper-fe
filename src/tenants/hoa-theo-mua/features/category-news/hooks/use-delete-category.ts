import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import newsCategoryService from '../services'
import { getErrorDescription, getResponseMessage } from './error-description'

const ARTICLE_CATEGORY_FORM_PREFIX = 'articleCategories.form' as const

interface DeleteCategoryParams {
  onDeleteSuccess?: () => void
}

export const useDeleteCategory = ({ onDeleteSuccess }: DeleteCategoryParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation({
    mutationFn: newsCategoryService.deleteNewsCategory,
    onSuccess: (message) => {
      toast.success(getResponseMessage(message) || t(`${ARTICLE_CATEGORY_FORM_PREFIX}.deleteSuccess`))
      onDeleteSuccess?.()
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: t(`${ARTICLE_CATEGORY_FORM_PREFIX}.deleteError ${getErrorDescription(error.response?.data)}`)
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categoriesNews'] })
      queryClient.invalidateQueries({ queryKey: ['categoryNews', variables.id] })
    }
  })

  return { deleteCategory, isDeletingCategory }
}
