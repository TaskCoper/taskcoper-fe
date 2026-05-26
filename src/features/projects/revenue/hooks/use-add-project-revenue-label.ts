import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectRevenueService from '../services'
import type { RevenueLabel } from '../types'
import type { AddProjectRevenueLabelFormValues } from '../validations'
import { addProjectRevenueLabelSchema } from '../validations'

export const useAddProjectRevenueLabel = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectRevenueLabelFormValues>({
    resolver: zodResolver(addProjectRevenueLabelSchema(t))
  })

  const { mutate: addProjectRevenueLabel, isPending: isAddingProjectRevenueLabel } = useMutation({
    mutationFn: projectRevenueService.addProjectRevenueLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.revenueLabels.all(projectIdentifier) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<RevenueLabel>>(
        queryKeys.projects.revenueLabels.list(projectIdentifier)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<RevenueLabel>>(
          queryKeys.projects.revenueLabels.list(projectIdentifier),
          (old) => {
            if (!old) return old

            const newLabel: RevenueLabel = {
              id: `temp-${Date.now()}`,
              name: variables.body.name,
              color: variables.body.color
            }

            return {
              ...old,
              value: {
                ...old.value,
                items: [...old.value.items, newLabel]
              }
            }
          }
        )
      }

      return { previousData }
    },
    onSuccess: () => {
      methods.reset({
        projectIdentifier,
        name: '',
        color: ''
      })
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
    }
  })

  return { methods, addProjectRevenueLabel, isAddingProjectRevenueLabel }
}
