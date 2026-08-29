import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recordMockAiCardDownload } from '../mock-data'
import type { AiCardHistoryItem } from '../types'
import { downloadAiCardImage } from '../utils/download-ai-card-image'

export const useDownloadAiCard = () => {
  const { t } = useTenantTranslation()
  const {
    mutate: downloadAiCard,
    isPending,
    variables
  } = useMutation({
    mutationFn: async (card: AiCardHistoryItem) => {
      if (!card.outputImageUrl?.trim()) throw new Error('Missing AI card output image')

      await downloadAiCardImage(card.outputImageUrl, card.code)

      // Replace this mock recorder with the download-tracking API once its contract is available.
      const isRecorded = await recordMockAiCardDownload(card.id)
      if (!isRecorded) throw new Error('AI card download was not recorded')
    },
    onError: () => {
      toast.error(t('aiCustom.download.failed'))
    }
  })

  return {
    downloadAiCard,
    isDownloadingAiCard: isPending,
    downloadingAiCardId: isPending ? variables?.id : undefined
  }
}
