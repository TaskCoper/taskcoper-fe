import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskMemberService from '../services'

interface AssignTaskMemberParams {
  taskId?: string
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useAssignTaskMember = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: AssignTaskMemberParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: assignTaskMember, isPending: isAssigningTaskMember } = useMutation({
    mutationFn: taskMemberService.assignTaskMember,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSuccess: () => {
      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(taskId)
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.members(taskId)
        })
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      }

      if (parentMilestoneIdentifier) {
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.memberStats(projectIdentifier, parentMilestoneIdentifier)
          })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      }

      if (projectIdentifier && user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      }
    }
  })

  return { assignTaskMember, isAssigningTaskMember }
}
