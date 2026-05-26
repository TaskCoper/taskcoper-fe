import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import projectRoleService from '../services'

export const useDeleteProjectRole = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { mutate: deleteProjectRole, isPending: isDeletingProjectRole } = useMutation({
    mutationFn: projectRoleService.deleteProjectRole,
    onSuccess: (message, variables) => {
      toast.success(message)
      navigate(`/projects/${variables.projectIdentifier}/settings?tab=permissions`)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.roles.list(variables.projectIdentifier) })
    }
  })

  return { deleteProjectRole, isDeletingProjectRole }
}
