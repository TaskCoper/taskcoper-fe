import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectRevenueService from '../services'
import type { RevenueLabel } from '../types'
import { updateProjectRevenueLabelSchema, type UpdateProjectRevenueLabelFormValues } from '../validations'

export const useUpdateProjectRevenueLabel = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateProjectRevenueLabelFormValues>({
    defaultValues: {
      id: '',
      name: '',
      color: '',
      projectIdentifier
    },
    resolver: zodResolver(updateProjectRevenueLabelSchema(t))
  })

  const { mutate: updateProjectRevenueLabel, isPending: isUpdatingProjectRevenueLabel } = useMutation({
    mutationFn: projectRevenueService.updateProjectRevenueLabel,
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.revenueLabels.all(projectIdentifier) })

      const previousData = queryClient.getQueryData<BasePaginationResponse<RevenueLabel>>(
        queryKeys.projects.revenueLabels.list(projectIdentifier)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<RevenueLabel>>(
          queryKeys.projects.revenueLabels.list(projectIdentifier),
          (old) => {
            if (!old) return old

            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.map((item) =>
                  item.id === body.id ? { ...item, name: body.name, color: body.color } : item
                )
              }
            }
          }
        )
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.projects.revenueLabels.list(projectIdentifier), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenueLabels.list(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenueLabels.stats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.all(projectIdentifier) })
    }
  })

  return { methods, updateProjectRevenueLabel, isUpdatingProjectRevenueLabel }
}
