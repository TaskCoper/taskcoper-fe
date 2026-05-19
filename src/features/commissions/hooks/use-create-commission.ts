import { MentorTitle } from '@/features/mentor-applications/types'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import commissionService from '../services'
import { CommissionTargetModel } from '../types'
import { createCommissionSchema, type CreateCommissionFormValues } from '../validations'

export const useCreateCommission = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<CreateCommissionFormValues>({
    resolver: zodResolver(createCommissionSchema(t)),
    defaultValues: {
      targetModel: CommissionTargetModel.MentorPackage,
      titleLevel: MentorTitle.BRONZE,
      rate: 0,
      minAmount: 0,
      maxAmount: 0,
      isActive: true
    }
  })

  const { mutate: createCommission, isPending: isCreatingCommission } = useMutation({
    mutationFn: commissionService.createCommission,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.commissions.public() })
    }
  })

  return { methods, createCommission, isCreatingCommission }
}
