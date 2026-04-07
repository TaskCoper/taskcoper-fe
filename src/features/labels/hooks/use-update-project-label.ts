import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import projectService from '@/services/project.service'
import type { Label } from '@/types/label.type'
import type { TaskDetail } from '@/types/task.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectLabelSchema, type UpdateProjectLabelFormValues } from '../validations'

interface UpdateProjectLabelProps {
  projectIdentifier: string
  taskId: string
  parentMilestoneIdentifier: string
}

export const useUpdateProjectLabel = ({
  projectIdentifier,
  taskId,
  parentMilestoneIdentifier
}: UpdateProjectLabelProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const methods = useForm<UpdateProjectLabelFormValues>({
    defaultValues: {
      id: '',
      name: '',
      color: ''
    },
    resolver: zodResolver(updateProjectLabelSchema(t))
  })

  const { mutate: updateProjectLabel, isPending: isUpdatingProjectLabel } = useMutation({
    mutationFn: projectService.updateLabel,
    onMutate: async ({ body }) => {
      const queryKey = ['project-labels', projectIdentifier]
      await queryClient.cancelQueries({ queryKey })

      const previousLabels = queryClient.getQueryData<BasePaginationResponse<Label>>(queryKey)
      const previousTask = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskId))

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
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskId), (old) => {
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
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousTask)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labels(projectIdentifier) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.UserId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labelStatsAll(projectIdentifier) })
    }
  })

  return { methods, updateProjectLabel, isUpdatingProjectLabel }
}
