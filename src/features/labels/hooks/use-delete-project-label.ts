import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import projectService from '@/services/project.service'
import type { Label } from '@/types/label.type'
import type { TaskDetail } from '@/types/task.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteProjectLabelProps {
  taskId: string
  projectId: string
  parentMilestoneId: string
}

export const useDeleteProjectLabel = ({ taskId, projectId, parentMilestoneId }: UseDeleteProjectLabelProps) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const { mutate: deleteProjectLabel, isPending: isDeletingProjectLabel } = useMutation({
    mutationFn: projectService.deleteLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.labels(projectId) })

      const previousLabels = queryClient.getQueryData<BasePaginationResponse<Label>>(
        queryKeys.projects.labels(projectId)
      )
      const previousTask = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskId))

      if (previousLabels) {
        queryClient.setQueryData<BasePaginationResponse<Label>>(queryKeys.projects.labels(projectId), (old) => {
          if (!old) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.filter((item) => item.id !== variables.labelId)
            }
          }
        })
      }

      if (previousTask) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskId), (old) => {
          if (!old) return old

          return {
            ...old,
            taskLabels: old.taskLabels.filter((item) => item.projectTaskLabelId !== variables.labelId)
          }
        })
      }

      return { previousLabels, previousTask }
    },
    onError: (error, _variables, context) => {
      if (context?.previousLabels) {
        queryClient.setQueryData(queryKeys.projects.labels(projectId), context.previousLabels)
      }

      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousTask)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labels(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
    }
  })

  return { deleteProjectLabel, isDeletingProjectLabel }
}
