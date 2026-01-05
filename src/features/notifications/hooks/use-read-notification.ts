import notificationService from '@/services/notification.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useReadNotification = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: readNotification, isPending: isReadingNotification } = useMutation({
    mutationFn: notificationService.readNotification,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    }
  })

  return { readNotification, isReadingNotification }
}
