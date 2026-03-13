import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { Revenue } from '@/types/project.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectRevenueSchema, type UpdateProjectRevenueFormValues } from '../validations'

export const useUpdateProjectRevenue = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateProjectRevenueFormValues>({
    resolver: zodResolver(updateProjectRevenueSchema(t))
  })

  const { mutate: updateProjectRevenue, isPending: isUpdatingProjectRevenue } = useMutation({
    mutationFn: projectService.updateProjectRevenue,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projectRevenues.all(variables.body.projectId) })

      const previousRevenues = queryClient.getQueriesData<BasePaginationResponse<Revenue>>({
        queryKey: queryKeys.projectRevenues.all(variables.body.projectId)
      })

      queryClient.setQueriesData<BasePaginationResponse<Revenue>>(
        {
          queryKey: queryKeys.projectRevenues.all(variables.body.projectId)
        },
        (old) => {
          if (!old) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.map((revenue) =>
                revenue.id === variables.body.projectTransactionId
                  ? {
                      ...revenue,
                      name: variables.body.name,
                      amount: variables.body.amount,
                      type: variables.body.type,
                      note: variables.body.note
                    }
                  : revenue
              )
            }
          }
        }
      )

      return { previousRevenues }
    },
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error, variables, context) => {
      if (context?.previousRevenues) {
        queryClient.setQueryData(queryKeys.projectRevenues.all(variables.body.projectId), context.previousRevenues)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.all(variables.body.projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.typeStats(variables.body.projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.stats(variables.body.projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.stats(variables.body.projectId) })
    }
  })

  return { methods, updateProjectRevenue, isUpdatingProjectRevenue }
}
