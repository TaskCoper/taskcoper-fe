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
    mutationFn: ({ labelId }: { labelId: string }) => projectService.deleteRevenueLabel({ projectId, labelId }),
    onMutate: async ({ labelId }: { labelId: string }) => {
      const queryKey = queryKeys.projectRevenue.labels(projectId)
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<BasePaginationResponse<RevenueLabel>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<RevenueLabel>>(queryKey, (old) => {
          if (!old) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.filter((item) => item.id !== labelId)
            }
          }
        })
      }

      return { previousData }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.projectRevenue.labels(projectId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error?.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenue.labels(projectId) })
    }
  })

  return { deleteProjectRevenueLabel, isDeletingProjectRevenueLabel }
}
