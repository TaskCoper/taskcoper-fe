import z from 'zod'

const bookingTimeSlotSchema = z.object({
  startTimeUtc: z.iso.datetime({ offset: true }),
  endTimeUtc: z.iso.datetime({ offset: true })
})

export const bookMeetingSchema = () => {
  return z.object({
    mentorId: z.uuid(),
    bookingTimeSlots: z.array(bookingTimeSlotSchema).min(1),
    bookByUserId: z.uuid(),
    bookByProjectId: z.uuid().nullable(),
    packageBookingId: z.uuid().nullable(),
    packageSessionNumber: z.number().positive().nullable()
  })
}

export type BookMeetingFormValues = z.infer<ReturnType<typeof bookMeetingSchema>>
