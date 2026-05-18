import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { invalidateMilestoneTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { MilestoneWithTasks, ParentMilestone } from '../../core/types'
import milestoneService from '../services'

type CacheData = BasePaginationResponse<ParentMilestone> | MilestoneWithTasks

export const useUpdateMilestone = ({
  shouldInvalidate,
  queryKey,
  parentMilestoneIdentifier,
  projectIdentifier
}: {
  shouldInvalidate?: boolean
  queryKey?: readonly unknown[]
  parentMilestoneIdentifier?: string
  projectIdentifier?: string
} = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: updateMilestone, isPending: isUpdatingMilestone } = useMutation({
    mutationFn: milestoneService.updateMilestone,
    onMutate: async (variables) => {
      if (!queryKey) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<CacheData>(queryKey)

      if (previousData) {
        queryClient.setQueryData<CacheData>(queryKey, (old) => {
          if (!old) return old

          // if has milestones property then it is MilestoneWithTasks
          if ('milestones' in old) {
            const newMilestones = old.milestones.map((item) =>
              item.id === variables.body.milestoneId
                ? { ...item, name: variables.body.milestoneName, position: variables.body.position }
                : item
            )
            return { ...old, milestones: newMilestones }
          }

          // else it is BasePaginationResponse<ParentMilestone>
          const newItems = old.value.items.map((item) =>
            item.id === variables.body.milestoneId
              ? { ...item, name: variables.body.milestoneName, position: variables.body.position }
              : item
          )

          return {
            ...old,
            value: {
              ...old.value,
              items: newItems
            }
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (queryKey && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (shouldInvalidate && queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }

      invalidateMilestoneTree(queryClient, { projectIdentifier, parentMilestoneIdentifier })

      if (projectIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      }
    }
  })

  return { updateMilestone, isUpdatingMilestone }
}
