import z from 'zod'

export const updateMentorProfileSchema = z.object({
  userIdentifier: z.string().min(1),
  shortBio: z.string().max(255),
  description: z.string().max(10_000)
})

export type UpdateMentorProfileFormValues = z.infer<typeof updateMentorProfileSchema>
