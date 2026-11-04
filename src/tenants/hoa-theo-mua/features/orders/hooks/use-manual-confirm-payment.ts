import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { Role } from '@/features/users/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import orderService from '../services'
import { OrderStatus } from '../types'
import { vndFormatter } from '../utils'

interface ManualConfirmPaymentOrder {
  orderId: string
  totalFee: number | null
  status: OrderStatus
}

export const useManualConfirmPayment = () => {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const queryClient = useQueryClient()
  const { me } = useGetMe()
  const canConfirmPayment = me?.role === Role.Admin
  const confirmationInProgress = useRef(false)

  const { mutateAsync, isPending: isConfirmingPayment } = useMutation({
    mutationFn: orderService.manualConfirmPayment,
    retry: false,
    onSuccess: () => {
      toast.success(t('systemOrders.action.confirmPaymentSuccess'))
    },
    onError: (error) => {
      toast.error(t('systemOrders.action.confirmPaymentFailed'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders', 'system'] })
  })

  const manualConfirmPayment = useCallback(
    async (order: ManualConfirmPaymentOrder) => {
      if (!canConfirmPayment || order.status !== OrderStatus.Pending || confirmationInProgress.current) return

      // Cover both the confirmation dialog and the request, including cache refresh.
      confirmationInProgress.current = true
      try {
        const confirmed = await confirm({
          title: t('systemOrders.action.confirmPaymentTitle'),
          description: t('systemOrders.action.confirmPaymentDescription', {
            code: order.orderId,
            amount: order.totalFee == null ? t('systemOrders.common.noDataShort') : vndFormatter.format(order.totalFee)
          }),
          confirmText: t('systemOrders.action.confirmPaymentConfirm')
        })

        if (confirmed) await mutateAsync({ orderId: order.orderId })
      } catch {
        // The mutation reports the server error; keep the current page available for retry.
      } finally {
        confirmationInProgress.current = false
      }
    },
    [canConfirmPayment, confirm, mutateAsync, t]
  )

  return { manualConfirmPayment, isConfirmingPayment, canConfirmPayment }
}
