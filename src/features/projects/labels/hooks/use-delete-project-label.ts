import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import type { Label } from '@/types/label.type'
import type { TaskDetail } from '@/types/task.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectLabelService from '../services'

interface UseDeleteProjectLabelProps {
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export const useDeleteProjectLabel = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: UseDeleteProjectLabelProps) => {
  const queryClient = useQueryClient()
  const { me: user } = useGetMe()
  const { t } = useTranslation()

  const { mutate: deleteProjectLabel, isPending: isDeletingProjectLabel } = useMutation({
    mutationFn: projectLabelService.deleteProjectLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.labels(projectIdentifier) })

      const previousLabels = queryClient.getQueryData<BasePaginationResponse<Label>>(
        queryKeys.projects.labels(projectIdentifier)
      )
      const previousTask = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskId))

      if (previousLabels) {
        queryClient.setQueryData<BasePaginationResponse<Label>>(queryKeys.projects.labels(projectIdentifier), (old) => {
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
        queryClient.setQueryData(queryKeys.projects.labels(projectIdentifier), context.previousLabels)
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
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labels(projectIdentifier) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labelStatsAll(projectIdentifier) })
    }
  })

  return { deleteProjectLabel, isDeletingProjectLabel }
}
