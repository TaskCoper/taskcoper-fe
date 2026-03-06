import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import mentorApplicationService from '@/services/mentor-application.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { submitMentorApplicationSchema, type SubmitMentorApplicationFormValues } from '../validations'

export type FileUploadStatus = 'uploading' | 'success' | 'error'

const defaultValues: SubmitMentorApplicationFormValues = {
  shortBio: '',
  description: '',
  portfolioFiles: []
}

export const useSubmitMentorApplication = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<SubmitMentorApplicationFormValues>({
    defaultValues,
    resolver: zodResolver(submitMentorApplicationSchema(t))
  })

  const [uploadStatuses, setUploadStatuses] = useState<Record<number, FileUploadStatus>>({})

  const { uploadFileAsync } = useUploadFile({ onError: () => {} })

  const clearUploadStatuses = () => setUploadStatuses({})

  const onSubmit = async (values: SubmitMentorApplicationFormValues) => {
    const total = values.portfolioFiles.length

    // Mark every file as uploading
    setUploadStatuses(Object.fromEntries(values.portfolioFiles.map((_, i) => [i, 'uploading'])))

    const toastId = toast.loading(t('common.ui.uploading'), {
      description: t('mentorApplication.submit.uploadingParallel', { total })
    })

    // Fire all uploads at once and update each card's status as it settles
    const promises = values.portfolioFiles.map((file, i) =>
      uploadFileAsync({ file })
        .then((url) => {
          setUploadStatuses((prev) => ({ ...prev, [i]: 'success' }))
          return url ?? null
        })
        .catch((err: AxiosError<ErrorResponse>) => {
          setUploadStatuses((prev) => ({ ...prev, [i]: 'error' }))
          console.error(`Failed to upload "${file.name}":`, err.response?.data?.detail ?? err.message)
          return null
        })
    )

    const settled = await Promise.allSettled(promises)

    const portfolioUrls: string[] = []
    const failedNames: string[] = []

    settled.forEach((result, i) => {
      const url = result.status === 'fulfilled' ? result.value : null
      if (url) {
        portfolioUrls.push(url)
      } else {
        failedNames.push(values.portfolioFiles[i].name)
      }
    })

    if (failedNames.length === total) {
      toast.error(t('mentorApplication.submit.allUploadsFailed'), {
        id: toastId,
        description: t('mentorApplication.submit.allUploadsFailedDescription')
      })
      return
    }

    if (failedNames.length > 0) {
      toast.warning(t('mentorApplication.submit.partialUpload', { count: portfolioUrls.length, total }), {
        id: toastId,
        description: t('mentorApplication.submit.partialUploadFailed', { names: failedNames.join(', ') })
      })
    } else {
      toast.success(t('common.ui.uploadSuccess'), { id: toastId, description: null })
    }

    const finalBody = {
      shortBio: values.shortBio,
      description: values.description,
      portfolioUrls
    }

    submitMentorApplication({ body: finalBody })
  }

  const { mutate: submitMentorApplication, isPending: isSubmittingMentorApplication } = useMutation({
    mutationFn: mentorApplicationService.submitMentorApplication,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorApplications.my() })
    }
  })

  return {
    methods,
    onSubmit,
    uploadStatuses,
    clearUploadStatuses,
    submitMentorApplication,
    isSubmittingMentorApplication
  }
}
