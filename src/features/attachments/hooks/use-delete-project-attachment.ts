import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteProjectAttachmentProps {
  projectId: string
}

export const useDeleteProjectAttachment = ({ projectId }: UseDeleteProjectAttachmentProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const {
    mutate: deleteProjectAttachment,
    mutateAsync: deleteProjectAttachmentAsync,
    isPending: isDeletingProjectAttachment
  } = useMutation({
    mutationFn: projectService.deleteAttachment,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectResources.all(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceStats(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceMemberStats(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mimeTypeStats(projectId) })
    }
  })

  return { deleteProjectAttachment, deleteProjectAttachmentAsync, isDeletingProjectAttachment }
}
