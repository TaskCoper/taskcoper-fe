import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { RevenueLabel } from '@/types/label.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectLabelSchema, type UpdateProjectLabelFormValues } from '../validations'

export const useUpdateProjectRevenueLabel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateProjectLabelFormValues>({
    defaultValues: {
      id: '',
      name: '',
      color: ''
    },
    resolver: zodResolver(updateProjectLabelSchema(t))
  })

  const { mutate: updateProjectRevenueLabel, isPending: isUpdatingProjectRevenueLabel } = useMutation({
    // accept { body } to match callers that pass { body }
    mutationFn: ({ body }: { body: UpdateProjectLabelFormValues }) =>
      projectService.updateRevenueLabel({
        projectId,
        labelId: body.id,
        name: body.name,
        color: body.color
      }),
    onMutate: async (variables: { body: UpdateProjectLabelFormValues }) => {
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
              items: old.value.items.map((item) =>
                item.id === variables.body.id
                  ? { ...item, name: variables.body.name, color: variables.body.color }
                  : item
              )
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

  return { methods, updateProjectRevenueLabel, isUpdatingProjectRevenueLabel }
}
