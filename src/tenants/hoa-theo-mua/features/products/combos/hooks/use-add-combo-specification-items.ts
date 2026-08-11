import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'
import type { AddComboSpecificationItemsPayload } from '../types'

export const useAddComboSpecificationItems = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: addComboSpecificationItems, isPending: isAddingComboSpecificationItems } = useMutation({
    mutationFn: ({ comboId, body }: { comboId: string; body: AddComboSpecificationItemsPayload }) =>
      productService.addComboSpecificationItems({ comboId, body }),
    onSuccess: (message, { comboId }) => {
      toast.success(message || t('products.detail.comboSpecification.addSuccess'))
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecification(comboId) })
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(comboId) })
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { addComboSpecificationItems, isAddingComboSpecificationItems }
}
