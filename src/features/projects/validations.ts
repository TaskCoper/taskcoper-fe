import z from 'zod'

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const createProjectSchema = (t: (key: string) => string) => {
  return z
    .object({
      name: z
        .string()
        .min(1, t('project.createProject.validation.name.minLength'))
        .max(255, t('project.createProject.validation.name.maxLength')),
      description: z.string().max(255, t('project.createProject.validation.description.maxLength')),
      startDate: z.iso.datetime({ message: t('project.createProject.validation.startDate.invalid') }).or(z.literal('')),
      endDate: z.iso.datetime({ message: t('project.createProject.validation.endDate.invalid') }).or(z.literal('')),
      domainIds: z
        .array(z.string())
        .min(1, t('project.createProject.validation.domainIds.minLength'))
        .refine((ids) => ids.every((id) => UUID_REGEX.test(id)), {
          message: t('project.createProject.validation.domainIds.invalid')
        })
    })
    .strict()
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true

        const start = new Date(data.startDate)
        const end = new Date(data.endDate)

        return end > start
      },
      {
        message: t('project.createProject.validation.endDate.mustBeGreater'),
        path: ['endDate']
      }
    )
}

export type CreateProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>
