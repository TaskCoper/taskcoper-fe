import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectMemberService from '../services'

export const useDeleteProjectMember = ({ identifier }: { identifier: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: deleteProjectMember, isPending: isDeletingProjectMember } = useMutation({
    mutationFn: projectMemberService.deleteProjectMember,
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
    }
  })

  return { deleteProjectMember, isDeletingProjectMember }
}
