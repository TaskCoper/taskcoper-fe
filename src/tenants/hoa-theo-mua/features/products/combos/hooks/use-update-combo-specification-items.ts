import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'
import type { UpdateComboSpecificationItemsPayload } from '../types'

export const useUpdateComboSpecificationItems = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: updateComboSpecificationItems, isPending: isUpdatingComboSpecificationItems } = useMutation({
    mutationFn: ({ comboId, body }: { comboId: string; body: UpdateComboSpecificationItemsPayload }) =>
      productService.updateComboSpecificationItems({ comboId, body }),
    onSuccess: (message) => {
      toast.success(message || t('products.detail.comboSpecification.updateSuccess'))
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecificationsRoot() })
      void queryClient.invalidateQueries({ queryKey: productKeys.detailsRoot() })
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { updateComboSpecificationItems, isUpdatingComboSpecificationItems }
}
