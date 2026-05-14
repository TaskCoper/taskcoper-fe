import type { TFunction } from 'i18next'
import z from 'zod'

const bookingTimeSlotSchema = (t: TFunction) =>
  z
    .object({
      startTimeUtc: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      endTimeUtc: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') })
    })
    .strict()

export const bookMeetingSchema = (t: TFunction) => {
  return z
    .object({
      mentorId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      bookingTimeSlots: z.array(bookingTimeSlotSchema(t)).min(1, t('common.validation.required')),
      bookByUserId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      bookByProjectId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      packageBookingId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      packageSessionNumber: z.number().positive(t('common.validation.number.positive')).nullable()
    })
    .strict()
}

export const cancelMeetingSchema = (t: TFunction) => {
  return z
    .object({
      meetingId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      reason: z.string().min(1, t('common.validation.required')).max(255, t('common.validation.maxLength.255'))
    })
    .strict()
}

export const updateMeetingSchema = (t: TFunction) => {
  return z
    .object({
      meetingId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      startTimeUtc: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      endTimeUtc: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      reason: z.string().max(255, t('common.validation.maxLength.255')).nullable(),
      note: z.string().max(2000, t('common.validation.maxLength.2000')).nullable(),
      meetingLink: z.url({ message: t('common.validation.url.invalid') }).nullable()
    })
    .strict()
}

export type BookMeetingFormValues = z.infer<ReturnType<typeof bookMeetingSchema>>
export type CancelMeetingFormValues = z.infer<ReturnType<typeof cancelMeetingSchema>>
export type UpdateMeetingFormValues = z.infer<ReturnType<typeof updateMeetingSchema>>
