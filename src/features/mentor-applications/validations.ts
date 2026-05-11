import { ApplicationStatus, MentorTitle } from '@/features/mentor-applications/types'
import type { TFunction } from 'i18next'
import z from 'zod'

export const submitMentorApplicationSchema = (t: TFunction) =>
  z
    .object({
      shortBio: z
        .string()
        .min(1, t('mentorApplication.validation.shortBioRequired'))
        .max(255, t('mentorApplication.validation.shortBioMax')),
      description: z
        .string()
        .min(1, t('mentorApplication.validation.descriptionRequired'))
        .max(10_000, t('mentorApplication.validation.descriptionMax')),
      portfolioFiles: z
        .array(z.instanceof(File))
        .min(1, t('mentorApplication.validation.portfolioFilesMin'))
        .max(10, t('mentorApplication.validation.portfolioFilesMax'))
    })
    .strict()

export const reviewMentorApplicationSchema = (t: TFunction) =>
  z
    .object({
      applicationId: z.string(),
      status: z.enum(ApplicationStatus),
      adminNote: z.string().nullable(),
      titleLevel: z.enum(MentorTitle).nullable()
    })
    .strict()
    .refine(
      (data) => data.status !== ApplicationStatus.REJECTED || (data.adminNote && data.adminNote.trim().length > 0),
      {
        message: t('mentorApplication.validation.adminNoteRequiredForRejection'),
        path: ['adminNote']
      }
    )
    .refine(
      (data) => data.status !== ApplicationStatus.APPROVED || (data.titleLevel && data.titleLevel.trim().length > 0),
      {
        message: t('mentorApplication.validation.titleLevelRequiredForApproval'),
        path: ['titleLevel']
      }
    )

export type SubmitMentorApplicationFormValues = z.infer<ReturnType<typeof submitMentorApplicationSchema>>
export type ReviewMentorApplicationFormValues = z.infer<ReturnType<typeof reviewMentorApplicationSchema>>
