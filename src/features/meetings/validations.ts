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

export const cancelMeetingSchema = () => {
  return z.object({
    meetingId: z.uuid(),
    reason: z.string().min(1).max(255)
  })
}

export const rescheduleMeetingSchema = () => {
  return z.object({
    meetingId: z.uuid(),
    startTimeUtc: z.iso.datetime({ offset: true }),
    endTimeUtc: z.iso.datetime({ offset: true }),
    reason: z.string().min(1).max(255)
  })
}

export type BookMeetingFormValues = z.infer<ReturnType<typeof bookMeetingSchema>>
export type CancelMeetingFormValues = z.infer<ReturnType<typeof cancelMeetingSchema>>
export type RescheduleMeetingFormValues = z.infer<ReturnType<typeof rescheduleMeetingSchema>>
