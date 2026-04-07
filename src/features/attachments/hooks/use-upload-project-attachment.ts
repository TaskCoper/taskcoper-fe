import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseUploadProjectAttachmentProps {
  projectIdentifier: string
}

export const useUploadProjectAttachment = ({ projectIdentifier }: UseUploadProjectAttachmentProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const {
    mutate: uploadProjectAttachment,
    mutateAsync: uploadProjectAttachmentAsync,
    isPending: isUploadingProjectAttachment
  } = useMutation({
    mutationFn: projectService.uploadAttachment,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectResources.all(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier) })
    }
  })

  return { uploadProjectAttachment, uploadProjectAttachmentAsync, isUploadingProjectAttachment }
}
