import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import generateAiService from '../services'
import type { GeneratedCardHistoryItem } from '../types'
import { downloadAiCardImage } from '../utils/download-ai-card-image'

const getDownloadErrorDescription = (error: unknown) => {
  if (!isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return undefined

  const responseData = error.response.data as Record<string, unknown>
  const apiError = responseData.error

  if (apiError && typeof apiError === 'object') {
    const message = (apiError as Record<string, unknown>).message
    if (typeof message === 'string') return message
  }

  return typeof responseData.detail === 'string' ? responseData.detail : undefined
}

export const useDownloadAiCard = () => {
  const { t } = useTenantTranslation()
  const {
    mutate: downloadAiCard,
    isPending,
    variables
  } = useMutation({
    mutationFn: async (card: GeneratedCardHistoryItem) => {
      const download = await generateAiService.getAiCardDownload(card.generatedCardId)
      await downloadAiCardImage(download.imageUrl, download.fileName, download.contentType)
    },
    onError: (error) => {
      toast.error(t('aiCustom.download.failed'), {
        description: getDownloadErrorDescription(error)
      })
    }
  })

  return {
    downloadAiCard,
    isDownloadingAiCard: isPending,
    downloadingAiCardId: isPending ? variables?.generatedCardId : undefined
  }
}
