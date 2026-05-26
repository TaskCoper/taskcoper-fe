import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectRevenueService from '../services'

export const useDeleteProjectRevenue = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: deleteProjectRevenue, isPending: isDeletingProjectRevenue } = useMutation({
    mutationFn: projectRevenueService.deleteProjectRevenue,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.all(variables.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.typeStats(variables.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenueLabels.stats(variables.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.stats(variables.projectIdentifier) })
    }
  })

  return { deleteProjectRevenue, isDeletingProjectRevenue }
}
