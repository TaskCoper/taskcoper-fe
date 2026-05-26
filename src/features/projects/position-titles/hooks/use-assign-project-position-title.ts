import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectPositionTitleService from '../services'

export const useAssignProjectPositionTitle = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: assignProjectPositionTitle, isPending: isAssigningProjectPositionTitle } = useMutation({
    mutationFn: projectPositionTitleService.assignProjectPositionTitle,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members.all(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.positionTitles.list(projectIdentifier) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.positionTitles.member(projectIdentifier, variables.userId)
      })
    }
  })

  return { assignProjectPositionTitle, isAssigningProjectPositionTitle }
}
