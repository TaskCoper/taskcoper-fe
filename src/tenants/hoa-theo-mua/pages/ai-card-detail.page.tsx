import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowLeftIcon, DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { AiCardOutputImage } from '../features/ai-custom/components/ai-card-output-image'
import { useDownloadAiCard } from '../features/ai-custom/hooks/use-download-ai-card'
import { useGetAiCardDetail } from '../features/ai-custom/hooks/use-get-ai-card-detail'

export default function AiCardDetailPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams()
  const { aiCard, isGettingAiCard } = useGetAiCardDetail(id)
  const { downloadAiCard, downloadingAiCardId } = useDownloadAiCard()
  const isDownloading = downloadingAiCardId === aiCard?.id

  return (
    <div className='space-y-6 p-6'>
      <Button variant='ghost' size='sm' asChild>
        <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards`}>
          <ArrowLeftIcon data-icon='inline-start' />
          {t('aiCustom.detail.back')}
        </Link>
      </Button>

      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>{t('aiCustom.detail.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('aiCustom.detail.description')}</p>
        </div>

        {aiCard && (
          <Button disabled={isDownloading} onClick={() => downloadAiCard(aiCard)}>
            {isDownloading ? <LoaderCircleIcon className='animate-spin' /> : <DownloadIcon />}
            {t('aiCustom.download.action')}
          </Button>
        )}
      </div>

      {isGettingAiCard ? (
        <Skeleton className='aspect-[4/3] w-full max-w-2xl rounded-xl' />
      ) : aiCard ? (
        <div className='grid max-w-4xl gap-6 rounded-xl border bg-card p-5 shadow-sm md:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
          <AiCardOutputImage
            src={aiCard.outputImageUrl}
            alt={t('aiCustom.history.previewAlt', { code: aiCard.code })}
          />
          <dl className='space-y-4'>
            <div>
              <dt className='text-sm text-muted-foreground'>{t('aiCustom.history.column.code')}</dt>
              <dd className='mt-1 font-mono font-medium'>{aiCard.code}</dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>{t('aiCustom.history.column.customer')}</dt>
              <dd className='mt-1 font-medium'>{aiCard.customerName || t('aiCustom.history.walkInCustomer')}</dd>
              <dd className='text-sm text-muted-foreground'>{aiCard.customerPhone || '-'}</dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>{t('aiCustom.history.column.template')}</dt>
              <dd className='mt-1 font-medium'>{aiCard.templateName || '-'}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className='rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground'>
          {t('aiCustom.detail.notFound')}
        </div>
      )}
    </div>
  )
}
