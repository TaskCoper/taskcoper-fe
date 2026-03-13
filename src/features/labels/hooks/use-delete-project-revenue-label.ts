import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { RevenueLabel } from '@/types/label.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteProjectRevenueLabel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteProjectRevenueLabel, isPending: isDeletingProjectRevenueLabel } = useMutation({
    mutationFn: projectService.deleteProjectRevenueLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projectRevenueLabels.all(projectId) })

      const previousData = queryClient.getQueryData<BasePaginationResponse<RevenueLabel>>(
        queryKeys.projectRevenueLabels.list(projectId)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<RevenueLabel>>(
          queryKeys.projectRevenueLabels.list(projectId),
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
        queryClient.setQueryData(queryKeys.projectRevenueLabels.list(projectId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.list(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.stats(projectId) })
    }
  })

  return { deleteProjectRevenueLabel, isDeletingProjectRevenueLabel }
}
