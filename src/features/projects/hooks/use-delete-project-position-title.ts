import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteProjectPositionTitle = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteProjectPositionTitle, isPending: isDeletingProjectPositionTitle } = useMutation({
    mutationFn: projectService.deleteProjectPositionTitle,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.positionTitles.list(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members.all(projectIdentifier) })
    }
  })

  return { deleteProjectPositionTitle, isDeletingProjectPositionTitle }
}
