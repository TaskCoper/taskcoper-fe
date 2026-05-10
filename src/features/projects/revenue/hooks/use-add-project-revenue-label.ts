import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import type { RevenueLabel } from '@/types/label.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { AddProjectRevenueLabelFormValues } from '../../../labels/validations'
import { addProjectRevenueLabelSchema } from '../../../labels/validations'
import projectRevenueService from '../services'

export const useAddProjectRevenueLabel = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectRevenueLabelFormValues>({
    resolver: zodResolver(addProjectRevenueLabelSchema(t))
  })

  const { mutate: addProjectRevenueLabel, isPending: isAddingProjectRevenueLabel } = useMutation({
    mutationFn: projectRevenueService.addProjectRevenueLabel,
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

  return { methods, addProjectRevenueLabel, isAddingProjectRevenueLabel }
}
