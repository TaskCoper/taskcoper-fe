import taskService from '@/services/task.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addTaskCommentSchema, type AddTaskCommentFormValues } from '../validations'

interface UseAddCommentProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

export const useAddComment = ({ taskId, projectId, parentMilestoneId }: UseAddCommentProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddTaskCommentFormValues>({
    resolver: zodResolver(addTaskCommentSchema(t))
  })

  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: taskService.addComment,
    onSuccess: () => {
      const taskId = methods.getValues('taskId')
      methods.reset({
        taskId,
        content: '',
        commentResources: []
      })
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
      }
    }
  })

  return { methods, addComment, isAddingComment }
}
