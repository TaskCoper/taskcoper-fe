import z from 'zod'

export const addProjectPositionTitleSchema = z
  .object({
    projectIdentifier: z.string().min(1),
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(255),
    color: z.string().trim().max(255)
  })
  .strict()

export const updateProjectPositionTitleSchema = addProjectPositionTitleSchema
  .extend({
    titleId: z.uuid()
  })
  .strict()

export type AddProjectPositionTitleFormValues = z.infer<typeof addProjectPositionTitleSchema>
export type UpdateProjectPositionTitleFormValues = z.infer<typeof updateProjectPositionTitleSchema>
