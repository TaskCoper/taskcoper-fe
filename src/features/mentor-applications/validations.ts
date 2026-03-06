import type { TFunction } from 'i18next'
import z from 'zod'

export const submitMentorApplicationSchema = (t: TFunction) =>
  z.object({
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

export type SubmitMentorApplicationFormValues = z.infer<ReturnType<typeof submitMentorApplicationSchema>>
