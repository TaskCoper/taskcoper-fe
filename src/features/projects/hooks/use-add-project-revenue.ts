import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addProjectRevenueSchema, type AddProjectRevenueFormValues } from '../validations'

export const useAddProjectRevenue = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectRevenueFormValues>({
    resolver: zodResolver(addProjectRevenueSchema(t))
  })

  const { mutate: addProjectRevenue, isPending: isAddingProjectRevenue } = useMutation({
    mutationFn: projectService.addProjectRevenue,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.all(variables.body.projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.typeStats(variables.body.projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenueLabels.stats(variables.body.projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectRevenues.stats(variables.body.projectId) })
    }
  })

  return { methods, addProjectRevenue, isAddingProjectRevenue }
}
