import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectService from '../services'
import { updateProjectSchema, type UpdateProjectFormValues } from '../validations'

export const useUpdateProject = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema(t))
  })

  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    mutationFn: projectService.updateProject,
    // onSuccess: (message) => {
    //   toast.success(message)
    // },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.allMy() })
    }
  })

  return { methods, updateProject, isUpdatingProject }
}
