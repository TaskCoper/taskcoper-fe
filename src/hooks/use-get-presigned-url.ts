import api, { type BaseResponse } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export interface GetPresignedUrlParams {
  key: string
  contentType: string
}

interface GetPresignedUrlResponse {
  presignedUrl: string
  contentType: string
  uploadMethod: 'PUT' | 'POST'
  requiredHeaders: string[]
  instructions: string
}

export const useGetPresignedUrl = () => {
  const { t } = useTranslation()

  const {
    mutate: getPresignedUrl,
    mutateAsync: getPresignedUrlAsync,
    isPending: isGettingPresignedUrl
  } = useMutation({
    mutationFn: async ({ key, contentType }: GetPresignedUrlParams) => {
      const { data } = await api.get<BaseResponse<GetPresignedUrlResponse>>('/v1/storages/presigned-url', {
        params: {
          key,
          contentType
        }
      })

      return data.value
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { getPresignedUrl, getPresignedUrlAsync, isGettingPresignedUrl }
}
