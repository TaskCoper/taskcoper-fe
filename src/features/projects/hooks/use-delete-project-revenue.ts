import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteProjectRevenue = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: deleteProjectRevenue, isPending: isDeletingProjectRevenue } = useMutation({
    mutationFn: projectService.deleteProjectRevenue,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.all(variables.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.typeStats(variables.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.stats(variables.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.stats(variables.projectIdentifier) })
    }
  })

  return { deleteProjectRevenue, isDeletingProjectRevenue }
}
