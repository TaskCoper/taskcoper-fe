import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseUnassignMemberProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

export const useUnassignMember = ({ taskId, projectId, parentMilestoneId }: UseUnassignMemberProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { mutate: unassignMember, isPending: isUnassigningMember } = useMutation({
    mutationFn: taskService.unassignMember,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSuccess: () => {
      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: ['task', taskId]
        })
        queryClient.invalidateQueries({
          queryKey: ['taskMembers', taskId]
        })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: ['my-assigned-tasks', projectId, user?.UserId] })
      }
    }
  })

  return { unassignMember, isUnassigningMember }
}
