import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskMemberService from '../services'

interface UnassignTaskMemberParams {
  taskId?: string
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useUnassignTaskMember = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: UnassignTaskMemberParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: unassignTaskMember, isPending: isUnassigningTaskMember } = useMutation({
    mutationFn: taskMemberService.unassignTaskMember,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSuccess: () => {
      invalidateTaskTree(queryClient, {
        taskId,
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })

      if (projectIdentifier && parentMilestoneIdentifier) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.memberStats(projectIdentifier, parentMilestoneIdentifier)
        })
      }
    }
  })

  return { unassignTaskMember, isUnassigningTaskMember }
}
