import type { I18nKey } from '@/lib/i18n/types'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import voucherService from '../services'
import { DiscountType, Scope } from '../types'
import { createVoucherSchema, type CreateVoucherFormValues } from '../validations'

export const useCreateVoucher = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const methods = useForm<CreateVoucherFormValues>({
    defaultValues: {
      code: '',
      name: '',
      description: null,
      discountType: DiscountType.Percentage,
      discountValue: undefined,
      startsAtUtc: '',
      endsAtUtc: '',
      scope: Scope.AllTargets,
      totalUsageLimit: undefined,
      usageLimitPerUser: undefined,
      isStackable: true,
      targets: []
    },
    resolver: zodResolver(createVoucherSchema(t))
  })

  const {
    mutate: createVoucher,
    mutateAsync: createVoucherAsync,
    isPending: isCreatingVoucher
  } = useMutation({
    mutationFn: voucherService.createVoucher,
    onSuccess: (message) => {
      toast.success(t(message as I18nKey))
      methods.reset()
      setOpen(false)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.scopeStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.typeStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.targetStats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.vouchers.statusStats() })
    }
  })

  return { methods, createVoucher, createVoucherAsync, isCreatingVoucher, open, setOpen }
}
