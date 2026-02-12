import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseAssignMemberProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

export const useAssignMember = ({ taskId, projectId, parentMilestoneId }: UseAssignMemberProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { mutate: assignMember, isPending: isAssigningMember } = useMutation({
    mutationFn: taskService.assignMember,
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

      if (parentMilestoneId) {
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.memberStats(projectId, parentMilestoneId) })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }
    }
  })

  return { assignMember, isAssigningMember }
}
