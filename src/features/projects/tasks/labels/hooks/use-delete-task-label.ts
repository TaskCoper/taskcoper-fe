import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { TaskDetail } from '../../core/types'
import taskLabelService from '../services'

interface DeleteTaskLabelParams {
  taskIdentifier: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}

export const useDeleteTaskLabel = ({
  taskIdentifier,
  projectIdentifier,
  parentMilestoneIdentifier
}: DeleteTaskLabelParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutateAsync: deleteTaskLabel, isPending: isDeletingTaskLabel } = useMutation({
    mutationFn: taskLabelService.deleteTaskLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
      const previousData = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskIdentifier))

      if (previousData) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskIdentifier), (old) => {
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
        queryClient.setQueryData(queryKeys.tasks.detail(taskIdentifier), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId: taskIdentifier,
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.labelStats({ projectIdentifier, parentMilestoneIdentifier })
      })
    }
  })

  return { deleteTaskLabel, isDeletingTaskLabel }
}
