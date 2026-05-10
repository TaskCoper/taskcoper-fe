import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetProjectLabels } from '@/features/projects/labels/hooks/use-get-project-labels'
import type { TaskLabel } from '@/features/projects/tasks/labels/types'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { TaskDetail } from '../../core/types'
import taskLabelService from '../services'
import { addTaskLabelSchema, type AddTaskLabelFormValues } from '../validations'

interface AddTaskLabelParams {
  taskIdentifier: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
  enabled?: boolean
}

export const useAddTaskLabel = ({
  taskIdentifier,
  projectIdentifier,
  parentMilestoneIdentifier,
  enabled = true
}: AddTaskLabelParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()
  const { labels } = useGetProjectLabels({ projectIdentifier, enabled })

  const methods = useForm<AddTaskLabelFormValues>({
    resolver: zodResolver(addTaskLabelSchema)
  })

  const { mutate: addTaskLabel, isPending: isAddingTaskLabel } = useMutation({
    mutationFn: taskLabelService.addTaskLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
      const previousData = queryClient.getQueryData<TaskDetail>(queryKeys.tasks.detail(taskIdentifier))

      if (previousData) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskIdentifier), (old) => {
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
        queryClient.setQueryData(queryKeys.tasks.detail(taskIdentifier), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskIdentifier) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.labelStats({ projectIdentifier, parentMilestoneIdentifier })
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
    }
  })

  return { methods, addTaskLabel, isAddingTaskLabel }
}
