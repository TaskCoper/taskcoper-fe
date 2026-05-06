import z from 'zod'

const bookingTimeSlotSchema = z
  .object({
    startTimeUtc: z.iso.datetime({ offset: true }),
    endTimeUtc: z.iso.datetime({ offset: true })
  })
  .strict()

export const bookMeetingSchema = () => {
  return z
    .object({
      mentorId: z.uuid(),
      bookingTimeSlots: z.array(bookingTimeSlotSchema).min(1),
      bookByUserId: z.uuid(),
      bookByProjectId: z.uuid().nullable(),
      packageBookingId: z.uuid().nullable(),
      packageSessionNumber: z.number().positive().nullable()
    })
    .strict()
}

export const cancelMeetingSchema = () => {
  return z
    .object({
      meetingId: z.uuid(),
      reason: z.string().min(1).max(255)
    })
    .strict()
}

export const updateMeetingSchema = () => {
  return z
    .object({
      meetingId: z.uuid(),
      startTimeUtc: z.iso.datetime({ offset: true }),
      endTimeUtc: z.iso.datetime({ offset: true }),
      reason: z.string().max(255).nullable(),
      note: z.string().max(2000).nullable(),
      meetingLink: z.url().nullable()
    })
    .strict()
}

export type BookMeetingFormValues = z.infer<ReturnType<typeof bookMeetingSchema>>
export type CancelMeetingFormValues = z.infer<ReturnType<typeof cancelMeetingSchema>>
export type UpdateMeetingFormValues = z.infer<ReturnType<typeof updateMeetingSchema>>
