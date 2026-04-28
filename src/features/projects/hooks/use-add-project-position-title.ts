import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addProjectPositionTitleSchema, type AddProjectPositionTitleFormValues } from '../validations'

export const useAddProjectPositionTitle = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectPositionTitleFormValues>({
    resolver: zodResolver(addProjectPositionTitleSchema)
  })

  const { mutate: addProjectPositionTitle, isPending: isAddingProjectPositionTitle } = useMutation({
    mutationFn: projectService.addProjectPositionTitle,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset({
        projectIdentifier,
        name: '',
        description: '',
        color: ''
      })
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
    }
  })

  return { methods, addProjectPositionTitle, isAddingProjectPositionTitle }
}
