import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import subtaskService from '../services'

interface AssignSubtaskMemberParams {
  taskId?: string
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useAssignSubtaskMember = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: AssignSubtaskMemberParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: assignSubtaskMember, isPending: isAssigningSubtaskMember } = useMutation({
    mutationFn: subtaskService.assignSubtaskMember,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId,
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })
    }
  })

  return { assignSubtaskMember, isAssigningSubtaskMember }
}
