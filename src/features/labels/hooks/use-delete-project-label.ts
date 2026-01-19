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
      const queryKey = ['project-labels', projectId]
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<BasePaginationResponse<Label>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Label>>(queryKey, (old) => {
          if (!old) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.filter((item) => item.id !== variables.labelId)
            }
          }
        })

        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskId), (old) => {
          if (!old) return old

          return {
            ...old,
            taskLabels: old.taskLabels.filter((item) => item.projectTaskLabelId !== variables.labelId)
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.projects.labels(projectId), context.previousData)
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

      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
    }
  })

  return { deleteProjectLabel, isDeletingProjectLabel }
}
