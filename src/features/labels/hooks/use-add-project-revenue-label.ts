/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { RevenueLabel } from '@/types/label.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { AddProjectLabelFormValues } from '../validations'
import { addProjectLabelSchema } from '../validations'

export const useAddProjectRevenueLabel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectLabelFormValues>({
    resolver: zodResolver(addProjectLabelSchema(t))
  })

  const { mutate: addProjectRevenueLabel, isPending: isAddingProjectRevenueLabel } = useMutation({
    // accept { body } to match callers that pass { body }
    mutationFn: ({ body }: { body: AddProjectLabelFormValues }) =>
      projectService.createRevenueLabel({
        projectId: body.projectId ?? projectId,
        name: body.name,
        color: body.color
      }),
    onMutate: async ({ body }: { body: AddProjectLabelFormValues }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projectRevenue.labels(projectId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<RevenueLabel>>(
        queryKeys.projectRevenue.labels(projectId)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<RevenueLabel>>(
          queryKeys.projectRevenue.labels(projectId),
          (old) => {
            if (!old) return old

            const newLabel: RevenueLabel = {
              id: `temp-${Date.now()}`,
              name: body.name,
              color: body.color
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
        queryClient.setQueryData(queryKeys.projectRevenue.labels(projectId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: (error as any)?.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenue.labels(projectId) })
    }
  })

  return { methods, addProjectRevenueLabel, isAddingProjectRevenueLabel }
}
