import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'
import type { ProductDetail } from '../../types'
import type { ComboSpecification } from '../types'

export const useUpdateComboPublication = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: updateComboPublication, isPending: isUpdatingComboPublication } = useMutation({
    mutationFn: ({ comboId, publish }: { comboId: string; publish: boolean }) =>
      publish ? productService.publishCombo({ comboId }) : productService.unpublishCombo({ comboId }),
    onSuccess: (message, { comboId, publish }) => {
      toast.success(
        message ||
          t(
            publish
              ? 'products.detail.comboSpecification.publishSuccess'
              : 'products.detail.comboSpecification.unpublishSuccess'
          )
      )

      queryClient.setQueryData<ProductDetail>(productKeys.detail(comboId), (current) =>
        current ? { ...current, isActive: publish } : current
      )
      queryClient.setQueryData<ComboSpecification | null>(productKeys.comboSpecification(comboId), (current) =>
        current ? { ...current, isActive: publish } : current
      )
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { updateComboPublication, isUpdatingComboPublication }
}
