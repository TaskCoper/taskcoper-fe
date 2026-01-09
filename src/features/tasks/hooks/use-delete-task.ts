import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteTaskProps {
  projectId?: string
  parentMilestoneId?: string
  onDeleteSuccess?: () => void
}

export const useDeleteTask = ({ projectId, parentMilestoneId, onDeleteSuccess }: UseDeleteTaskProps) => {
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
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: ['my-assigned-tasks', projectId, user?.UserId] })
      }
    }
  })

  return { deleteTask, isDeletingTask }
}
