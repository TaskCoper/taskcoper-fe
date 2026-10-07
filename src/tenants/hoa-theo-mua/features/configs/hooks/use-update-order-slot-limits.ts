import type { ErrorResponse } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { configKeys } from '../query-keys'
import configService from '../services'
import type { UpdateDeliverySlotLimitsBody } from '../types/order-slots'

export const useUpdateOrderSlotLimits = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: UpdateDeliverySlotLimitsBody) => configService.updateDeliverySlotLimits({ body }),
    onSuccess: () => {
      toast.success('Đã lưu giới hạn khung giờ nhận đơn')
      queryClient.invalidateQueries({ queryKey: configKeys.orderTags() })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errors = error.response?.data?.errors as { detail?: string } | null | undefined

      toast.error('Không thể lưu giới hạn khung giờ nhận đơn', {
        description: errors?.detail ?? error.response?.data?.detail
      })
    }
  })

  return {
    updateOrderSlotLimits: mutation.mutate,
    isUpdatingOrderSlotLimits: mutation.isPending
  }
}
