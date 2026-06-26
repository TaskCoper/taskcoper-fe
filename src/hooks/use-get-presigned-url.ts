import api, { type BaseResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
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
  const { t } = useTenantTranslation()

  const {
    mutate: getPresignedUrl,
    mutateAsync: getPresignedUrlAsync,
    isPending: isGettingPresignedUrl
  } = useMutation({
    mutationFn: async ({ key, contentType }: GetPresignedUrlParams) => {
      const { data } = await api.get<BaseResponse<GetPresignedUrlResponse>>('taskcoper-api/v1/storages/presigned-url', {
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
