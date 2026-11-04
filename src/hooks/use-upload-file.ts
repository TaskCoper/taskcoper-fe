import type { ErrorResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import config from '@/shared/config'
import { prepareFileUpload } from '@/shared/utils'
import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import axios, { AxiosError, type AxiosProgressEvent } from 'axios'
import { toast } from 'sonner'
import { useGetPresignedUrl } from './use-get-presigned-url'

interface UploadFileVariables {
  file: File
  signal?: AbortSignal
  onProgress?: (progress: number) => void
}

export const useUploadFile = (
  options?: UseMutationOptions<string | undefined, AxiosError<ErrorResponse>, UploadFileVariables>
) => {
  const { t } = useTenantTranslation()
  const { getPresignedUrlAsync } = useGetPresignedUrl()

  const mutation = useMutation({
    mutationFn: async ({ file, onProgress, signal }: UploadFileVariables) => {
      if (!file) throw new Error('Missing file')

      const { key, contentType } = prepareFileUpload(file)
      const { presignedUrl, uploadMethod } = await getPresignedUrlAsync({
        key,
        contentType,
        signal
      })

      const axiosConfig = {
        signal,
        timeout: 180_000,
        headers: {
          'Content-Type': contentType
          // 'x-amz-meta-owner': me.id
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        }
      }

      if (uploadMethod === 'PUT') {
        await axios.put(presignedUrl, file, axiosConfig)
      } else if (uploadMethod === 'POST') {
        await axios.post(presignedUrl, file, axiosConfig)
      }

      return `${config.baseFileUrl}/${key}`
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    ...options
  })

  return {
    uploadFile: mutation.mutate,
    uploadFileAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    resetUpload: mutation.reset
  }
}
