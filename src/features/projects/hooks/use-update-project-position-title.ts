import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProjectPositionTitleSchema, type UpdateProjectPositionTitleFormValues } from '../validations'

export const useUpdateProjectPositionTitle = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateProjectPositionTitleFormValues>({
    defaultValues: {
      projectIdentifier,
      titleId: '',
      name: '',
      description: '',
      color: ''
    },
    resolver: zodResolver(updateProjectPositionTitleSchema)
  })

  const { mutate: updateProjectPositionTitle, isPending: isUpdatingProjectPositionTitle } = useMutation({
    mutationFn: projectService.updateProjectPositionTitle,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.positionTitles.list(variables.body.projectIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members.all(variables.body.projectIdentifier) })
    }
  })

  return { methods, updateProjectPositionTitle, isUpdatingProjectPositionTitle }
}
