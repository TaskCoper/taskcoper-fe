import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { RevenueLabel } from '@/types/label.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectRevenueLabelSchema, type UpdateProjectRevenueLabelFormValues } from '../validations'

export const useUpdateProjectRevenueLabel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateProjectRevenueLabelFormValues>({
    defaultValues: {
      id: '',
      name: '',
      color: '',
      projectId
    },
    resolver: zodResolver(updateProjectRevenueLabelSchema(t))
  })

  const { mutate: updateProjectRevenueLabel, isPending: isUpdatingProjectRevenueLabel } = useMutation({
    mutationFn: projectService.updateProjectRevenueLabel,
    onMutate: async ({ body }) => {
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

  return { methods, updateProjectRevenueLabel, isUpdatingProjectRevenueLabel }
}
