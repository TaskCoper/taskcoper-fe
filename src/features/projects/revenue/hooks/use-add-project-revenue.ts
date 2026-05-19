import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectRevenueService from '../services'
import { addProjectRevenueSchema, type AddProjectRevenueFormValues } from '../validations'

export const useAddProjectRevenue = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectRevenueFormValues>({
    resolver: zodResolver(addProjectRevenueSchema(t))
  })

  const { mutate: addProjectRevenue, isPending: isAddingProjectRevenue } = useMutation({
    mutationFn: projectRevenueService.addProjectRevenue,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.all(variables.body.projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.typeStats(variables.body.projectIdentifier) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.revenueLabels.stats(variables.body.projectIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.revenues.stats(variables.body.projectIdentifier) })
    }
  })

  return { methods, addProjectRevenue, isAddingProjectRevenue }
}
