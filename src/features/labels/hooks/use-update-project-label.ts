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
  projectId: string
  taskId: string
  parentMilestoneId: string
}

export const useUpdateProjectLabel = ({ projectId, taskId, parentMilestoneId }: UpdateProjectLabelProps) => {
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
      const queryKey = ['project-labels', projectId]
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<BasePaginationResponse<Label>>(queryKey)

      if (previousData) {
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

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.projects.labels(projectId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labels(projectId) })

      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })

      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
    }
  })

  return { methods, updateProjectLabel, isUpdatingProjectLabel }
}
