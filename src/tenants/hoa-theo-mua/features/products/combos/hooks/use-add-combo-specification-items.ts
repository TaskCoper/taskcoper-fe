import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'

export const useAddComboSpecificationItems = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: addComboSpecificationItems, isPending: isAddingComboSpecificationItems } = useMutation({
    mutationFn: productService.addComboSpecificationItems,
    onSuccess: (message) => {
      toast.success(message || t('products.detail.comboSpecification.addSuccess'))
    },
    onError: (error) => {
      if (error.response?.status === 409) return

      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecificationsRoot() })
      void queryClient.invalidateQueries({ queryKey: productKeys.detailsRoot() })
    }
  })

  return { addComboSpecificationItems, isAddingComboSpecificationItems }
}
