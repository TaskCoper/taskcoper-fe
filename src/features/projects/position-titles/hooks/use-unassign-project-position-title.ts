import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectPositionTitleService from '../services'

export const useUnassignProjectPositionTitle = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: unassignProjectPositionTitle, isPending: isUnassigningProjectPositionTitle } = useMutation({
    mutationFn: projectPositionTitleService.unassignProjectPositionTitle,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members.all(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.positionTitles.list(projectIdentifier) })
    }
  })

  return { unassignProjectPositionTitle, isUnassigningProjectPositionTitle }
}
