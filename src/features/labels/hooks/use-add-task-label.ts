import { addTaskLabelSchema, type AddTaskLabelFormValues } from '@/features/tasks/validations'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import type { TaskLabel } from '@/types/label.type'
import type { TaskDetail } from '@/types/task.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetProjectLabels } from './use-get-project-labels'

interface UseAddTaskLabelProps {
  taskId: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  enabled?: boolean
}

export const useAddTaskLabel = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier,
  enabled = true
}: UseAddTaskLabelProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { labels } = useGetProjectLabels({ projectIdentifier, enabled })

  const methods = useForm<AddTaskLabelFormValues>({
    resolver: zodResolver(addTaskLabelSchema)
  })

  const { mutate: addTaskLabel, isPending: isAddingTaskLabel } = useMutation({
    mutationFn: taskService.addLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) })
      const previousData = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskId))

      if (previousData) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskId), (old) => {
          if (!old) return old

          const label = labels?.value.items.find((item) => item.id === variables.body.projectTaskLabelId)

          if (!label) return old

          const taskLabel: TaskLabel = {
            id: `temp-${Date.now()}`,
            color: label.color,
            name: label.name,
            projectTaskLabelId: label.id
          }

          return {
            ...old,
            taskLabels: [...old.taskLabels, taskLabel]
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.labelStats(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.UserId) })
    }
  })

  return { methods, addTaskLabel, isAddingTaskLabel }
}
