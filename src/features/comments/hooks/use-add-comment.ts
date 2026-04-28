import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addTaskCommentSchema, type AddTaskCommentFormValues } from '../validations'

interface UseAddCommentProps {
  taskId?: string
  identifier?: string
  milestoneIdentifier?: string
}

export const useAddComment = ({ taskId, identifier, milestoneIdentifier }: UseAddCommentProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

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
        mentionUsers: []
      })
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      }

      if (milestoneIdentifier) {
        if (identifier) {
          queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(identifier, milestoneIdentifier) })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(milestoneIdentifier) })
      }

      if (identifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(identifier, user?.id) })
      }
    }
  })

  return { methods, addComment, isAddingComment }
}
