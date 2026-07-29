import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorDescription } from '../error-description'
import categoryService from '../services'

/**
 * Persist a reordered child category. The optimistic reordering is done at drag time
 * (see the page's reorder handler); this hook just persists and re-syncs on settle.
 */
export const useReorderCategory = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: reorderCategory, isPending: isReorderingCategory } = useMutation({
    mutationFn: categoryService.reorderCategory,
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(error.response?.data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryProducts'] })
    }
  })

  return { reorderCategory, isReorderingCategory }
}
