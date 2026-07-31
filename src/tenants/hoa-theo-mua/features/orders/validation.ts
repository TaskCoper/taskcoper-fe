import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'

export const updateOrderFormSchema = (t: TenantT) =>
  z.object({
    orderId: z.uuid(),
    trackingNumber: z.string().nullable(),
    ahaMoveTrackingUrl: z.url(),
    shippingFee: z
      .string()
      .refine((value) => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0, {
        message: t('systemOrders.edit.invalidFee')
      })
  })

export type UpdateOrderFormValues = z.infer<ReturnType<typeof updateOrderFormSchema>>
