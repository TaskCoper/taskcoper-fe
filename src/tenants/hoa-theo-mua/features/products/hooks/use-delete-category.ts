import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryProductService } from '../services'
import { getErrorDescription, getResponseMessage } from './error-description'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const

interface DeleteCategoryParams {
  onDeleteSuccess?: () => void
}

export const useDeleteCategory = ({ onDeleteSuccess }: DeleteCategoryParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: deleteCategory, isPending: isDeletingCategory } = useMutation({
    mutationFn: categoryProductService.deleteCategory,
    onSuccess: (message) => {
      toast.success(getResponseMessage(message) || t(`${CATEGORY_FORM_PREFIX}.deleteSuccess`))
      onDeleteSuccess?.()
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
      queryClient.invalidateQueries({ queryKey: ['categoryProduct', variables.id] })
    }
  })

  return { deleteCategory, isDeletingCategory }
}
