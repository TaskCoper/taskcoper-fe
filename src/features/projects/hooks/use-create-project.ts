import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createProjectSchema, type CreateProjectFormValues } from '../validations'

const defaultValues: CreateProjectFormValues = {
  name: '',
  // description: '',
  // startDate: '',
  // endDate: '',
  domainIds: []
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const methods = useForm<CreateProjectFormValues>({
    defaultValues,
    resolver: zodResolver(createProjectSchema(t))
  })

  const {
    mutate: createProject,
    mutateAsync: createProjectAsync,
    isPending: isCreatingProject
  } = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
      setOpen(false)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.allMy })
    }
  })

  return { methods, createProject, createProjectAsync, isCreatingProject, open, setOpen }
}
