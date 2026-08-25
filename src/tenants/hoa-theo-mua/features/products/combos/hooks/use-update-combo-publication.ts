import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'

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
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(comboId) })
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecification(comboId) })
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { updateComboPublication, isUpdatingComboPublication }
}
