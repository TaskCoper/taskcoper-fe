import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import jobDescriptionService from '../services'

export const useDeleteJobDescription = () => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()

  const { mutate: deleteJobDescription, isPending: isDeleting } = useMutation({
    mutationFn: jobDescriptionService.deleteJobDescription,
    onSuccess: () => {
      toast.success(t('recruitment.jobs.delete.success'))
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-descriptions'] })
    }
  })

  return { deleteJobDescription, isDeleting }
}
