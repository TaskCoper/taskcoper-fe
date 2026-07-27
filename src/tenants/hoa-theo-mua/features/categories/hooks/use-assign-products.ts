import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription, getResponseMessage } from '../error-description'
import categoryService from '../services'
import type { AssignProductsPayload } from '../types'

const CATEGORY_ASSIGN_PREFIX = 'productCategories.assign' as const

interface AssignProductsParams {
  onAssignSuccess?: () => void
}

export const useAssignProducts = ({ onAssignSuccess }: AssignProductsParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: assignProducts, isPending: isAssigningProducts } = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignProductsPayload }) =>
      categoryService.assignProducts({ id, body }),
    onSuccess: (message) => {
      toast.success(getResponseMessage(message) || t(`${CATEGORY_ASSIGN_PREFIX}.success`))
      onAssignSuccess?.()
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
      queryClient.invalidateQueries({ queryKey: ['categoryProduct', variables.id] })
      // Every product in the submitted set may have gained or lost this category (§5).
      variables.body.productIds.forEach((productId) => {
        queryClient.invalidateQueries({ queryKey: ['product', productId] })
      })
    }
  })

  return { assignProducts, isAssigningProducts }
}
