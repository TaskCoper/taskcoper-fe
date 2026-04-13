import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { addProjectRoleSchema, type AddProjectRoleFormValues } from '../validations'

export const useAddProjectRole = () => {
  const methods = useForm<AddProjectRoleFormValues>({
    resolver: zodResolver(addProjectRoleSchema())
  })

  return { methods }
}
