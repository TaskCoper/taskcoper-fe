import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import voucherService from '../services'
import { addVoucherTargetsSchema, type AddVoucherTargetsFormValues } from '../validations'

export const useAddVoucherTargets = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddVoucherTargetsFormValues>({
    resolver: zodResolver(addVoucherTargetsSchema(t))
  })

  const { mutate: addVoucherTargets, isPending: isAddingVoucherTargets } = useMutation({
    mutationFn: voucherService.addVoucherTargets,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.detail(variables.body.voucherId), exact: true })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.targetStats() })
    }
  })

  return { methods, addVoucherTargets, isAddingVoucherTargets }
}
