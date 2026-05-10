import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addProjectRoleSchema, type AddProjectRoleFormValues } from '../../core/validations'
import projectRoleService from '../services'

export const useAddProjectRole = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectRoleFormValues>({
    resolver: zodResolver(addProjectRoleSchema(t))
  })

  const { mutate: addProjectRole, isPending: isAddingProjectRole } = useMutation({
    mutationFn: projectRoleService.addProjectRole,
    onSuccess: (message) => {
      toast(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.roles.list(variables.body.projectIdentifier) })
    }
  })

  return { methods, addProjectRole, isAddingProjectRole }
}
