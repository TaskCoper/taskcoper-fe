import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteTaskProps {
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
}: UseDeleteTaskProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

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
      if (parentMilestoneIdentifier) {
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.taskStatusStats(projectIdentifier, parentMilestoneIdentifier)
          })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
      }

      if (projectIdentifier && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.UserId) })
      }

      if (milestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.tasks(milestoneId) })
      }
    }
  })

  return { deleteTask, isDeletingTask }
}
