import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import orderService from '../services'
import type { SystemOrder } from '../types'
import { updateOrderFormSchema, type UpdateOrderFormValues } from '../validation'

const defaultValues: UpdateOrderFormValues = {
  orderId: '',
  trackingNumber: '',
  ahaMoveTrackingUrl: '',
  shippingFee: ''
}

export const useUpdateOrder = ({ order, onSuccess }: { order?: SystemOrder | null; onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()
  const schema = useMemo(() => updateOrderFormSchema(t), [t])

  const methods = useForm<UpdateOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const { reset } = methods

  useEffect(() => {
    reset(
      order
        ? {
            orderId: order.orderId,
            trackingNumber: order.trackNumber ?? '',
            ahaMoveTrackingUrl: order.ahahaMoveTrackingUrl ?? '',
            shippingFee: order.shippingFee != null ? String(order.shippingFee) : ''
          }
        : defaultValues
    )
  }, [order, reset])

  const { mutate: updateOrder, isPending: isUpdatingOrder } = useMutation({
    mutationFn: orderService.updateOrder,
    onSuccess: () => {
      toast.success(t('systemOrders.update.success'))
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'system'] })
    }
  })

  const onSubmit = methods.handleSubmit((values) => {
    updateOrder({ body: values })
  })

  return { methods, onSubmit, isUpdatingOrder }
}
