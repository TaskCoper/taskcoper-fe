import z from 'zod'

export const bookPackageSchema = z.object({
  mentorPackageId: z.uuid(),
  gatewayId: z.uuid(),
  bookedByProjectId: z.uuid().nullable(),
  voucherCode: z.string().nullable(),
  voucherIdempotencyKey: z.uuid().nullable()
})

export type BookPackageFormValues = z.infer<typeof bookPackageSchema>
