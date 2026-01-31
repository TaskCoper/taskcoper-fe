import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteTaskProps {
  projectId?: string
  parentMilestoneId?: string
  milestoneId?: string
  onDeleteSuccess?: () => void
}

export const useDeleteTask = ({ projectId, parentMilestoneId, milestoneId, onDeleteSuccess }: UseDeleteTaskProps) => {
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
      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }

      if (milestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.tasks(milestoneId) })
      }
    }
  })

  return { deleteTask, isDeletingTask }
}
