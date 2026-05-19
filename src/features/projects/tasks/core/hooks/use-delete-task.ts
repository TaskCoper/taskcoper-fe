import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskService from '../services'

interface DeleteTaskParams {
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
  milestoneId?: string
  onDeleteSuccess?: () => void
}

export const useDeleteTask = ({
  projectIdentifier,
  parentMilestoneIdentifier,
  milestoneId,
  onDeleteSuccess
}: DeleteTaskParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: deleteTask, isPending: isDeletingTask } = useMutation({
    mutationFn: taskService.deleteTask,
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSuccess: (message) => {
      toast.success(message)
      onDeleteSuccess?.()
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })

      if (parentMilestoneIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.taskStatusStats(projectIdentifier, parentMilestoneIdentifier)
          })
        }
      }

      if (milestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.tasks(milestoneId) })
      }
    }
  })

  return { deleteTask, isDeletingTask }
}
