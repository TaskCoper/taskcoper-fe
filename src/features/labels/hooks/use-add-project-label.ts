import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { Label } from '@/types/label.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { AddProjectLabelFormValues } from '../validations'
import { addProjectLabelSchema } from '../validations'

export const useAddProjectLabel = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<AddProjectLabelFormValues>({
    resolver: zodResolver(addProjectLabelSchema(t))
  })

  const { mutate: addProjectLabel, isPending: isAddingProjectLabel } = useMutation({
    mutationFn: projectService.addLabel,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.labels(projectIdentifier) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Label>>(
        queryKeys.projects.labels(projectIdentifier)
      )

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Label>>(queryKeys.projects.labels(projectIdentifier), (old) => {
          if (!old) return old

          const newLabel: Label = {
            id: `temp-${Date.now()}`,
            name: variables.body.name,
            color: variables.body.color,
            createdOnUtc: new Date().toISOString(),
            modifiedOnUtc: new Date().toISOString(),
            projectSlug: projectIdentifier
          }

          return {
            ...old,
            value: {
              ...old.value,
              items: [...old.value.items, newLabel]
            }
          }
        })
      }

      return { previousData }
    },
    onSuccess: () => {
      methods.reset({
        projectIdentifier,
        name: '',
        color: ''
      })
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.projects.labels(projectIdentifier), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labels(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.labelStatsAll(projectIdentifier) })
    }
  })

  return { methods, addProjectLabel, isAddingProjectLabel }
}
