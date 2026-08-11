import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { getErrorDescription } from '../../error-description'
import { productKeys } from '../../query-keys'
import productService from '../../services'
import type { UpdateComboSpecificationPayload } from '../types'

export const useUpdateComboSpecification = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutateAsync: updateComboSpecification, isPending: isUpdatingComboSpecification } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateComboSpecificationPayload }) =>
      productService.updateComboSpecification({ id, body }),
    onSuccess: (message, { id }) => {
      toast.success(message || t('products.detail.comboSpecification.saveSuccess'))
      void queryClient.invalidateQueries({ queryKey: productKeys.comboSpecification(id) })
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    }
  })

  return { updateComboSpecification, isUpdatingComboSpecification }
}
