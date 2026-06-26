import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import jobDescriptionService from '../services'
import type { JobDescriptionDetail } from '../types'
import { createJobDescriptionSchema, type CreateJobDescriptionFormValues } from '../validations'

const EMPLOYMENT_TYPE_MAP: Record<string, CreateJobDescriptionFormValues['employmentType']> = {
  fullTime: '0',
  partTime: '1'
}

const STATUS_MAP: Record<string, CreateJobDescriptionFormValues['status']> = {
  open: '0',
  closed: '1'
}

const toFormValues = (job: JobDescriptionDetail): CreateJobDescriptionFormValues => ({
  title: job.title,
  location: job.location,
  avatarUrl: job.avatarUrl ?? '',
  coverImageUrl: job.coverImageUrl ?? '',
  minExperienceYears: String(job.minExperienceYears),
  maxExperienceYears: String(job.maxExperienceYears),
  employmentType: EMPLOYMENT_TYPE_MAP[job.employmentType] ?? '0',
  salaryMin: String(job.salaryMin),
  salaryMax: String(job.salaryMax),
  salaryNegotiable: job.salaryNegotiable,
  description: job.description,
  status: STATUS_MAP[job.status] ?? '0',
  openings: String(job.openings)
})

export const useUpdateJobDescription = ({
  id,
  jobDescription,
  onSuccess
}: {
  id?: string
  jobDescription?: JobDescriptionDetail
  onSuccess?: () => void
}) => {
  const queryClient = useQueryClient()
  const { t } = useTenantTranslation()
  const schema = useMemo(() => createJobDescriptionSchema(t), [t])

  const methods = useForm<CreateJobDescriptionFormValues>({
    resolver: zodResolver(schema)
  })

  const { reset } = methods

  useEffect(() => {
    if (jobDescription) {
      reset(toFormValues(jobDescription))
    }
  }, [jobDescription, reset])

  const { mutate: updateJobDescription, isPending: isUpdating } = useMutation({
    mutationFn: (body: CreateJobDescriptionFormValues) => jobDescriptionService.updateJobDescription({ id: id!, body }),
    onSuccess: () => {
      onSuccess?.()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-description', id] })
      queryClient.invalidateQueries({ queryKey: ['job-descriptions'] })
    }
  })

  return { methods, updateJobDescription, isUpdating }
}
