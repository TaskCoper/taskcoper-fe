import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '@/tenants/hoa-theo-mua/config'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm, type DefaultValues } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import jobDescriptionService from '../services'
import { createJobDescriptionSchema, type CreateJobDescriptionFormValues } from '../validations'

const defaultValues: DefaultValues<CreateJobDescriptionFormValues> = {
  title: '',
  location: '',
  level: '0',
  employmentType: '0',
  salaryNegotiable: false,
  description: '',
  status: '0',
  openings: '',
  minExperienceYears: '',
  maxExperienceYears: '',
  salaryMin: '',
  salaryMax: ''
}

export const useCreateJobDescription = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()
  const schema = useMemo(() => createJobDescriptionSchema(t), [t])

  const methods = useForm<CreateJobDescriptionFormValues>({
    defaultValues,
    resolver: zodResolver(schema)
  })

  const { mutate: createJobDescription, isPending: isCreatingJobDescription } = useMutation({
    mutationFn: jobDescriptionService.createJobDescription,
    onSuccess: (message) => {
      toast.message(message)
      navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/recruitment`)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-descriptions'] })
    }
  })

  return { methods, createJobDescription, isCreatingJobDescription }
}
