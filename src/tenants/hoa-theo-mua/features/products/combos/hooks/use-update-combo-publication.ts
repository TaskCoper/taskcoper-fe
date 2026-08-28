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
    onMutate: async ({ comboId, publish }) => {
      const detailKey = productKeys.detail(comboId)
      const specificationKey = productKeys.comboSpecification(comboId)

      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: specificationKey })
      ])

      const previousDetail = queryClient.getQueryData<ProductDetail>(detailKey)
      const previousSpecification = queryClient.getQueryData<ComboSpecification | null>(specificationKey)

      queryClient.setQueryData<ProductDetail>(detailKey, (current) =>
        current ? { ...current, isActive: publish } : current
      )
      queryClient.setQueryData<ComboSpecification | null>(specificationKey, (current) =>
        current ? { ...current, isActive: publish } : current
      )

      return { previousDetail, previousSpecification }
    },
    onSuccess: (message, { publish }) => {
      toast.success(
        message ||
          t(
            publish
              ? 'products.detail.comboSpecification.publishSuccess'
              : 'products.detail.comboSpecification.unpublishSuccess'
          )
      )
    },
    onError: (error, { comboId }, context) => {
      queryClient.setQueryData(productKeys.detail(comboId), context?.previousDetail)
      queryClient.setQueryData(productKeys.comboSpecification(comboId), context?.previousSpecification)

      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: (_data, error, { comboId }) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(comboId) })
      if (error) {
        void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecification(comboId) })
      }
    }
  })

  return { updateComboPublication, isUpdatingComboPublication }
}
