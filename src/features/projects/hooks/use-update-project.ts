import projectService from '@/services/project.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectSchema, type UpdateProjectFormValues } from '../validations'

export const useUpdateProject = ({ projectId }: { projectId?: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema(t))
  })

  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    mutationFn: projectService.updateProject,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    }
  })

  return { methods, updateProject, isUpdatingProject }
}
