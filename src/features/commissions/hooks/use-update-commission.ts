import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import commissionService from '../services'
import { updateCommissionSchema, type UpdateCommissionFormValues } from '../validations'

export const useUpdateCommission = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateCommissionFormValues>({
    resolver: zodResolver(updateCommissionSchema(t))
  })

  const { mutate: updateCommission, isPending: isUpdatingCommission } = useMutation({
    mutationFn: commissionService.updateCommission,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.all })
    }
  })

  return { methods, updateCommission, isUpdatingCommission }
}
