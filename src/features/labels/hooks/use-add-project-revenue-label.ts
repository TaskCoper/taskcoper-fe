import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { RevenueLabel } from '@/types/label.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { AddProjectRevenueLabelFormValues } from '../validations'
import { addProjectRevenueLabelSchema } from '../validations'

export const useAddProjectRevenueLabel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectRevenueLabelFormValues>({
    resolver: zodResolver(addProjectRevenueLabelSchema(t))
  })

  const { mutate: addProjectRevenueLabel, isPending: isAddingProjectRevenueLabel } = useMutation({
    mutationFn: projectService.addProjectRevenueLabel,
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
        projectId,
        name: '',
        color: ''
      })
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

  return { methods, addProjectRevenueLabel, isAddingProjectRevenueLabel }
}
