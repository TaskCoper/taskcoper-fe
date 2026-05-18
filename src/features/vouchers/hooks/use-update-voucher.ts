import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import voucherService from '../services'
import { updateVoucherSchema, type UpdateVoucherFormValues } from '../validations'

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateVoucherFormValues>({
    resolver: zodResolver(updateVoucherSchema(t))
  })

  const { mutate: updateVoucher, isPending: isUpdatingVoucher } = useMutation({
    mutationFn: voucherService.updateVoucher,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.scopeStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.typeStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.targetStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.statusStats() })
    }
  })

  return { methods, updateVoucher, isUpdatingVoucher }
}
