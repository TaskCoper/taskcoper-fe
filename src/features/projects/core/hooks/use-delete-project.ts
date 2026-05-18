import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectService from '../services'

export const useDeleteProject = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: deleteProject, isPending: isDeletingProject } = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.allMy() })
    }
  })

  return { deleteProject, isDeletingProject }
}
