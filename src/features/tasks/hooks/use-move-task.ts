import taskService from '@/services/task.service'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useMoveTask = () => {
  const { t } = useTranslation()

  const { mutate: moveTask, isPending: isMovingTask } = useMutation({
    mutationFn: taskService.moveTask,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { moveTask, isMovingTask }
}
