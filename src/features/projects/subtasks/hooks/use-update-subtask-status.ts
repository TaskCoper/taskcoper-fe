import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { Subtask } from '../../tasks/subtasks/types'
import subtaskService from '../services'
import { updateSubtaskStatusSchema, type UpdateSubtaskStatusFormValues } from '../validations'

interface UseUpdateSubtaskStatusProps {
  taskId?: string
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useUpdateSubtaskStatus = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: UseUpdateSubtaskStatusProps = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const methods = useForm<UpdateSubtaskStatusFormValues>({
    resolver: zodResolver(updateSubtaskStatusSchema(t))
  })

  const queryKey = queryKeys.subtasks.byTask(taskId)

  const { mutate: updateSubtaskStatus, isPending: isUpdatingSubtaskStatus } = useMutation({
    mutationFn: subtaskService.updateSubtaskStatus,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          const targetItem = old.value.items.find((item) => item.id === variables.body.id)
          if (!targetItem) return old

          const isParent = targetItem.parentId === null
          const newStatus = variables.body.isCompleted

          // Helper to update items based on shouldUpdate condition
          const updateItems = (items: Subtask[], shouldUpdate: (item: Subtask) => boolean, status: boolean) =>
            items.map((item) => (shouldUpdate(item) ? { ...item, isCompleted: status } : item))

          let updatedItems = [...old.value.items]

          // parent decides children's statuses
          if (isParent) {
            // if parent is checked/unchecked -> Force ALL children to match.
            updatedItems = updateItems(
              updatedItems,
              (item) => item.id === variables.body.id || item.parentId === variables.body.id,
              newStatus
            )
          } else {
            // children influence parent's status
            const parentId = targetItem.parentId

            // update the specific subtask first
            updatedItems = updateItems(updatedItems, (item) => item.id === variables.body.id, newStatus)
            const siblings = old.value.items.filter(
              (item) => item.parentId === parentId && item.id !== variables.body.id
            )

            if (newStatus === true) {
              // updated subtask marked as done
              const allSiblingsCompleted = siblings.every((sibling) => sibling.isCompleted)

              if (allSiblingsCompleted) {
                // all siblings are true along with updated subtask is also true → parent becomes true
                updatedItems = updateItems(updatedItems, (item) => item.id === parentId, true)
              }
            } else {
              // updated subtask marked as false
              // if a single child becomes incomplete, the parent MUST become incomplete immediately
              updatedItems = updateItems(updatedItems, (item) => item.id === parentId, false)
            }
          }

          return {
            ...old,
            value: {
              ...old.value,
              items: updatedItems
            }
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

      if (parentMilestoneIdentifier) {
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
          })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      }

      if (projectIdentifier && user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      }
    }
  })

  return { methods, updateSubtaskStatus, isUpdatingSubtaskStatus }
}
