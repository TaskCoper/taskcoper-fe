import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'
import type { DeleteComboSpecificationItemsPayload } from '../types'

export const useDeleteComboSpecificationItems = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: deleteComboSpecificationItems, isPending: isDeletingComboSpecificationItems } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: DeleteComboSpecificationItemsPayload }) =>
      productService.deleteComboSpecificationItems({ id, body }),
    onSuccess: (message) => {
      toast.success(message || t('products.detail.comboSpecification.deleteSuccess'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecificationsRoot() })
      void queryClient.invalidateQueries({ queryKey: productKeys.detailsRoot() })
    }
  })

  return { deleteComboSpecificationItems, isDeletingComboSpecificationItems }
}
