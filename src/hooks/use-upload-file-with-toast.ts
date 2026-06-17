import type { ErrorResponse } from '@/lib/axios'
import type { AxiosError } from 'axios'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUploadFile } from './use-upload-file'

interface UploadFileWithToastParams {
  file: File
  loadingDescription?: ReactNode
  successDescription?: ReactNode | null
  showSuccessToast?: boolean
  renderProgress?: (progress: number) => ReactNode
  onUploaded?: (url: string) => Promise<void> | void
  errorDescription?: (error: unknown) => ReactNode | null | undefined
}

export const useUploadFileWithToast = (options?: Parameters<typeof useUploadFile>[0]) => {
  const { t } = useTranslation()
  const uploadMutation = useUploadFile(options)
  const { uploadFileAsync } = uploadMutation

  const uploadFileWithToast = useCallback(
    async ({
      file,
      loadingDescription,
      successDescription = null,
      showSuccessToast = true,
      renderProgress,
      onUploaded,
      errorDescription
    }: UploadFileWithToastParams) => {
      const toastId = toast.loading(t('common.ui.uploading'), {
        description: loadingDescription ?? t('common.ui.pleaseWait')
      })

      try {
        const url = await uploadFileAsync({
          file,
          onProgress: renderProgress
            ? (progress) => {
                toast.loading(t('common.ui.uploading'), {
                  id: toastId,
                  description: renderProgress(progress)
                })
              }
            : undefined
        })

        if (!url) {
          toast.error(t('error.somethingWentWrong'), {
            id: toastId,
            description: errorDescription?.(new Error(t('common.error.uploadNoUrlReturned')))
          })
          return null
        }

        if (onUploaded) {
          await onUploaded(url)
        }

        if (showSuccessToast) {
          toast.success(t('common.ui.uploadSuccess'), {
            id: toastId,
            description: successDescription
          })
        } else {
          toast.dismiss(toastId)
        }

        return url
      } catch (error) {
        toast.error(t('error.somethingWentWrong'), {
          id: toastId,
          description: errorDescription?.(error) ?? (error as AxiosError<ErrorResponse>).response?.data?.detail
        })
        return null
      }
    },
    [uploadFileAsync, t]
  )

  return {
    ...uploadMutation,
    uploadFileWithToast
  }
}
