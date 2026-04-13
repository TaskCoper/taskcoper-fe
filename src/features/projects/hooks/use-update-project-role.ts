import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectRoleSchema, type UpdateProjectRoleFormValues } from '../validations'

export const useUpdateProjectRole = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<UpdateProjectRoleFormValues>({
    resolver: zodResolver(updateProjectRoleSchema(t))
  })

  const { mutate: updateProjectRole, isPending: isUpdatingProjectRole } = useMutation({
    mutationFn: projectService.updateProjectRole,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_data, _error, variables) => {
      const identifier = variables.body.projectIdentifier || projectIdentifier

      queryClient.invalidateQueries({ queryKey: queryKeys.projects.roles.all(identifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.myPermissions(identifier) })
    }
  })

  return { methods, updateProjectRole, isUpdatingProjectRole }
}
