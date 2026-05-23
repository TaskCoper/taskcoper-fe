import { invalidateTaskTree } from '@/lib/invalidations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import subtaskService from '../services'

interface UnassignSubtaskMemberParams {
  taskId?: string
}

export const useUnassignSubtaskMember = ({ taskId }: UnassignSubtaskMemberParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: unassignSubtaskMember, isPending: isUnassigningSubtaskMember } = useMutation({
    mutationFn: subtaskService.unassignSubtaskMember,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId
      })
    }
  })

  return { unassignSubtaskMember, isUnassigningSubtaskMember }
}
