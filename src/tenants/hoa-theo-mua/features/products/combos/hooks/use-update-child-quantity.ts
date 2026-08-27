import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'

export const useUpdateChildQuantity = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: updateChildQuantity, isPending: isUpdatingChildQuantity } = useMutation({
    mutationFn: ({ productId, factor }: { productId: string; factor: number | null; parentId?: string }) =>
      productService.updateChildQuantity({ productId, factor }),
    onSuccess: (message) => {
      toast.success(message || t('products.detail.comboSpecification.updateFactorSuccess'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: (_data, _error, { productId, parentId }) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecification(productId) })
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) })
      if (parentId) void queryClient.invalidateQueries({ queryKey: productKeys.detail(parentId) })
    }
  })

  return { updateChildQuantity, isUpdatingChildQuantity }
}
