import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import orderService from '../services'
import { vndFormatter } from '../utils'

interface ManualConfirmPaymentOrder {
  orderId: string
  totalFee: number | null
}

export const useManualConfirmPayment = () => {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const queryClient = useQueryClient()

  const { mutate, isPending: isConfirmingPayment } = useMutation({
    mutationFn: orderService.manualConfirmPayment,
    onSuccess: () => {
      toast.success(t('systemOrders.action.confirmPaymentSuccess'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'system'] })
    }
  })

  const manualConfirmPayment = useCallback(
    async (order: ManualConfirmPaymentOrder) => {
      if (isConfirmingPayment) return

      const confirmed = await confirm({
        title: t('systemOrders.action.confirmPaymentTitle'),
        description: t('systemOrders.action.confirmPaymentDescription', {
          code: order.orderId.split('-')[0]?.toUpperCase() ?? order.orderId,
          amount: order.totalFee == null ? t('systemOrders.common.noDataShort') : vndFormatter.format(order.totalFee)
        }),
        confirmText: t('systemOrders.action.confirmPaymentConfirm')
      })

      if (confirmed) mutate({ orderId: order.orderId })
    },
    [confirm, isConfirmingPayment, mutate, t]
  )

  return { manualConfirmPayment, isConfirmingPayment }
}
