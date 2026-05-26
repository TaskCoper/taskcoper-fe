import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectResourceService from '../services'

interface UploadProjectResourceParams {
  projectIdentifier: string
}

export const useUploadProjectResource = ({ projectIdentifier }: UploadProjectResourceParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const {
    mutate: uploadProjectResource,
    mutateAsync: uploadProjectResourceAsync,
    isPending: isUploadingProjectResource
  } = useMutation({
    mutationFn: projectResourceService.uploadProjectResource,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources.all(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier) })
    }
  })

  return { uploadProjectResource, uploadProjectResourceAsync, isUploadingProjectResource }
}
