import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { TaskDetail } from '../../tasks/core/types'
import projectLabelService from '../services'
import type { Label } from '../types'
import { updateProjectLabelSchema, type UpdateProjectLabelFormValues } from '../validations'

interface UpdateProjectLabelProps {
  projectIdentifier: string
  taskIdentifier: string
  parentMilestoneIdentifier: string
}

export const useUpdateProjectLabel = ({
  projectIdentifier,
  taskIdentifier,
  parentMilestoneIdentifier
}: UpdateProjectLabelProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const methods = useForm<UpdateProjectLabelFormValues>({
    defaultValues: {
      id: '',
      name: '',
      color: ''
    },
    resolver: zodResolver(updateProjectLabelSchema(t))
  })

  const { mutate: updateProjectLabel, isPending: isUpdatingProjectLabel } = useMutation({
    mutationFn: projectLabelService.updateProjectLabel,
    onMutate: async ({ body }) => {
      const queryKey = queryKeys.projects.labels(projectIdentifier)
      await queryClient.cancelQueries({ queryKey })

      const previousLabels = queryClient.getQueryData<BasePaginationResponse<Label>>(queryKey)
      const previousTask = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskIdentifier))

      if (previousLabels) {
        queryClient.setQueryData<BasePaginationResponse<Label>>(queryKey, (old) => {
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
        })
      }

      if (previousTask) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskIdentifier), (old) => {
          if (!old) return old

          return {
            ...old,
            taskLabels: old.taskLabels.map((item) =>
              item.projectTaskLabelId === body.id ? { ...item, name: body.name, color: body.color } : item
            )
          }
        })
      }

      return { previousLabels, previousTask }
    },
    onError: (error, _variables, context) => {
      if (context?.previousLabels) {
        queryClient.setQueryData(queryKeys.projects.labels(projectIdentifier), context.previousLabels)
      }

      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(taskIdentifier), context.previousTask)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId: taskIdentifier,
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labels(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labelStatsAll(projectIdentifier) })
    }
  })

  return { methods, updateProjectLabel, isUpdatingProjectLabel }
}
