import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import type { TaskDetail } from '@/types/task.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteTaskLabelProps {
  taskId: string
  projectId: string
  parentMilestoneId: string
}

export const useDeleteTaskLabel = ({ taskId, projectId, parentMilestoneId }: UseDeleteTaskLabelProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { mutateAsync: deleteTaskLabel, isPending: isDeletingTaskLabel } = useMutation({
    mutationFn: taskService.deleteLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) })
      const previousData = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskId))

      if (previousData) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskId), (old) => {
          if (!old) return old

          return {
            ...old,
            taskLabels: [...old.taskLabels.filter((item) => item.id !== variables.id)]
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labelStats(projectId, parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
    }
  })

  return { deleteTaskLabel, isDeletingTaskLabel }
}
