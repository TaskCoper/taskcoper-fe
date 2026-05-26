import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectRevenueService from '../services'
import type { RevenueLabel } from '../types'

export const useDeleteProjectRevenueLabel = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteProjectRevenueLabel, isPending: isDeletingProjectRevenueLabel } = useMutation({
    mutationFn: projectRevenueService.deleteProjectRevenueLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projectRevenueLabels.all(projectIdentifier) })

      const previousData = queryClient.getQueryData<BasePaginationResponse<RevenueLabel>>(
        queryKeys.projectRevenueLabels.list(projectIdentifier)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<RevenueLabel>>(
          queryKeys.projectRevenueLabels.list(projectIdentifier),
          (old) => {
            if (!old) return old

            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.filter((item) => item.id !== variables.labelId)
              }
            }
          }
        )
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.projectRevenueLabels.list(projectIdentifier), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.list(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.stats(projectIdentifier) })
    }
  })

  return { deleteProjectRevenueLabel, isDeletingProjectRevenueLabel }
}
