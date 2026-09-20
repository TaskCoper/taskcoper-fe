import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../error-description'
import { productKeys } from '../query-keys'
import productService from '../services'

export interface UpdateProductDescriptionInput {
  id: string | number
  description: string
}

export const useUpdateProductDescription = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: updateProductDescription, isPending: isUpdatingProductDescription } = useMutation({
    mutationFn: (variables: UpdateProductDescriptionInput) => productService.updateProductDescription(variables),
    onSuccess: () => toast.success(t('products.detail.description.updated')),
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: isAxiosError(error) ? getErrorDescription(error.response?.data) : undefined
      })
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
    }
  })

  return { updateProductDescription, isUpdatingProductDescription }
}
