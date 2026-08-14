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
    mutationFn: ({ productId, factor }: { productId: string; factor: number }) =>
      productService.updateChildQuantity({ productId, factor }),
    onSuccess: (message, { productId }) => {
      toast.success(message || t('products.detail.comboSpecification.saveFactor'))
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecification(productId) })
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) })
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { updateChildQuantity, isUpdatingChildQuantity }
}
