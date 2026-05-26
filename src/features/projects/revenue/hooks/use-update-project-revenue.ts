import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectRevenueService from '../services'
import type { Revenue } from '../types'
import { updateProjectRevenueSchema, type UpdateProjectRevenueFormValues } from '../validations'

export const useUpdateProjectRevenue = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateProjectRevenueFormValues>({
    resolver: zodResolver(updateProjectRevenueSchema(t))
  })

  const { mutate: updateProjectRevenue, isPending: isUpdatingProjectRevenue } = useMutation({
    mutationFn: projectRevenueService.updateProjectRevenue,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.revenues.all(variables.body.projectIdentifier) })

      const previousRevenues = queryClient.getQueriesData<BasePaginationResponse<Revenue>>({
        queryKey: queryKeys.projects.revenues.all(variables.body.projectIdentifier)
      })

      queryClient.setQueriesData<BasePaginationResponse<Revenue>>(
        {
          queryKey: queryKeys.projects.revenues.all(variables.body.projectIdentifier)
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
        queryClient.setQueryData(
          queryKeys.projects.revenues.all(variables.body.projectIdentifier),
          context.previousRevenues
        )
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.all(variables.body.projectIdentifier) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.revenues.typeStats(variables.body.projectIdentifier)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.revenueLabels.stats(variables.body.projectIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.stats(variables.body.projectIdentifier) })
    }
  })

  return { methods, updateProjectRevenue, isUpdatingProjectRevenue }
}
