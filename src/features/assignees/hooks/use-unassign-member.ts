import { queryKeys } from '@/lib/query-keys'
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
          queryKey: queryKeys.tasks.detail(taskId)
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.members(taskId)
        })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }
    }
  })

  return { unassignMember, isUnassigningMember }
}
