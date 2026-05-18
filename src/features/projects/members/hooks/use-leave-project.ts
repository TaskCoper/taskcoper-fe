import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectMemberService from '../services'

export const useLeaveProject = ({ identifier }: { identifier?: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: leaveProject, isPending: isLeavingProject } = useMutation({
    mutationFn: projectMemberService.leaveProject,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members.all(identifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.allMy() })
    }
  })

  return { leaveProject, isLeavingProject }
}
