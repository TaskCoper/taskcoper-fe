import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteMember = ({ projectId }: { projectId: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: deleteMember, isPending: isDeletingMember } = useMutation({
    mutationFn: projectService.deleteMember,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
    }
  })

  return { deleteMember, isDeletingMember }
}
