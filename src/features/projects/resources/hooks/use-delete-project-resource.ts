import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectResourceService from '../services'

interface DeleteProjectResourceParams {
  projectIdentifier: string
}

export const useDeleteProjectResource = ({ projectIdentifier }: DeleteProjectResourceParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const {
    mutate: deleteProjectResource,
    mutateAsync: deleteProjectResourceAsync,
    isPending: isDeletingProjectResource
  } = useMutation({
    mutationFn: projectResourceService.deleteProjectResource,
    onSuccess: (message) => {
      toast.success(message)
    },
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

  return { deleteProjectResource, deleteProjectResourceAsync, isDeletingProjectResource }
}
