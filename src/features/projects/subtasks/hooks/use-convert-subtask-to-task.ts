import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import subtaskService from '../services'

interface UseConvertSubtaskToTaskParams {
  taskId: string
  projectIdentifier: string
  milestoneIdentifier: string
}

export const useConvertSubtaskToTask = ({
  taskId,
  projectIdentifier,
  milestoneIdentifier
}: UseConvertSubtaskToTaskParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me } = useGetMe()

  const { mutate: convertSubtaskToTask, isPending: isConvertingSubtaskToTask } = useMutation({
    mutationFn: subtaskService.convertToTask,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        projectIdentifier,
        parentMilestoneIdentifier: milestoneIdentifier,
        userId: me?.id
      })

      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
    }
  })

  return { convertSubtaskToTask, isConvertingSubtaskToTask }
}
