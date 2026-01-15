import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { recalculateParentStatus } from '../utils'

interface UseDeleteSubtaskProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

export const useDeleteSubtask = ({ taskId, projectId, parentMilestoneId }: UseDeleteSubtaskProps = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const queryKey = queryKeys.subtasks.byTask(taskId)

  const { mutate: deleteSubtask, isPending: isDeletingSubtask } = useMutation({
    mutationFn: subtaskService.deleteSubtask,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          const targetItem = old.value.items.find((item) => item.id === variables.id)
          if (!targetItem) return old

          let idsToDelete: string[] = [targetItem.id]

          // check if the target is a parent
          if (targetItem.parentId === null) {
            // if yes, we must also delete all its direct children.
            const childrenIds = old.value.items
              .filter((item) => item.parentId === targetItem.id)
              .map((child) => child.id)

            idsToDelete = [...idsToDelete, ...childrenIds]
          }
          // else: it's a child. we only delete itself (already in idsToDelete).

          // remove items from cache
          const remainingItems = old.value.items.filter((item) => !idsToDelete.includes(item.id))

          const parentId = targetItem.parentId
          if (parentId) {
            // recalculate parent status after child deletion
            recalculateParentStatus(remainingItems, parentId)
          }

          return {
            ...old,
            value: { ...old.value, items: remainingItems }
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (taskId && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }
    }
  })

  return { deleteSubtask, isDeletingSubtask }
}
