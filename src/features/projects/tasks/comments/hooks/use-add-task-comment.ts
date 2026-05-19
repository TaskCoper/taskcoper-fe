import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskCommentService from '../services'
import { addTaskCommentSchema, type AddTaskCommentFormValues } from '../validations'

interface AddTaskCommentParams {
  taskId?: string
  identifier?: string
  milestoneIdentifier?: string
}

export const useAddTaskComment = ({ taskId, identifier, milestoneIdentifier }: AddTaskCommentParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const methods = useForm<AddTaskCommentFormValues>({
    resolver: zodResolver(addTaskCommentSchema(t))
  })

  const { mutate: addTaskComment, isPending: isAddingTaskComment } = useMutation({
    mutationFn: taskCommentService.addTaskComment,
    onSuccess: () => {
      const taskId = methods.getValues('taskId')
      methods.reset({
        taskId,
        content: '',
        mentionUsers: []
      })
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId,
        projectIdentifier: identifier,
        parentMilestoneIdentifier: milestoneIdentifier,
        userId: user?.id
      })
    }
  })

  return { methods, addTaskComment, isAddingTaskComment }
}
