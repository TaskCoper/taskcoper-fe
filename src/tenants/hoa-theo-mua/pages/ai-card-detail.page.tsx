import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  DownloadIcon,
  LoaderCircleIcon,
  MailIcon,
  PackageSearchIcon,
  PhoneIcon
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/styles.css'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { AiCardOutputImage } from '../features/ai-custom/components/ai-card-output-image'
import { useDownloadAiCard } from '../features/ai-custom/hooks/use-download-ai-card'
import { useGetAiCardDetail } from '../features/ai-custom/hooks/use-get-ai-card-detail'
import { AiCardFileStatus, AiCardWritingMode } from '../features/ai-custom/types'

const AI_CARD_DETAIL_TABS = ['customer', 'message', 'design', 'orders'] as const

function InformationCard({ children }: { children: ReactNode }) {
  return <dl className='divide-y'>{children}</dl>
}

function InformationRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid gap-1 px-5 py-3 text-sm sm:grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] sm:items-start sm:gap-3'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='wrap-break-word font-medium'>{children}</dd>
    </div>
  )
}

function DetailPanel({
  title,
  description,
  action,
  className,
  contentClassName,
  children
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <section className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm', className)}>
      <div className='flex items-start justify-between gap-3 border-b bg-muted/20 px-5 py-4'>
        <div>
          <h2 className='font-bold'>{title}</h2>
          {description && <p className='mt-0.5 text-sm text-muted-foreground'>{description}</p>}
        </div>
        {action}
      </div>
      <div className={cn('flex-1 p-5', contentClassName)}>{children}</div>
    </section>
  )
}

export default function AiCardDetailPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null)
  const { aiCard, isGettingAiCard } = useGetAiCardDetail(id)
  const { downloadAiCard, downloadingAiCardId } = useDownloadAiCard()
  const isDownloading = downloadingAiCardId === aiCard?.id
  const isFileAvailable = aiCard?.fileStatus === AiCardFileStatus.Available && Boolean(aiCard.outputImageUrl?.trim())

  if (isGettingAiCard) {
    return (
      <div className='space-y-6 p-6'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-10 w-72' />
        <Skeleton className='aspect-16/7 w-full rounded-xl' />
        <Skeleton className='h-48 w-full rounded-xl' />
      </div>
    )
  }

  if (!aiCard) {
    return (
      <div className='space-y-6 p-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards`}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('aiCustom.detail.back')}
          </Link>
        </Button>
        <div className='rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground'>
          {t('aiCustom.detail.notFound')}
        </div>
      </div>
    )
  }

  const fileStatusLabel = t(`aiCustom.detail.fileStatus.${aiCard.fileStatus}`)
  const writingModeLabel = t(
    aiCard.writingMode === AiCardWritingMode.Calligraphy
      ? 'aiCustom.history.writingMode.calligraphy'
      : 'aiCustom.history.writingMode.typed'
  )
  const resultImageIndex = aiCard.outputImageUrl ? 0 : undefined
  const attachmentImageStartIndex = aiCard.outputImageUrl ? 1 : 0
  const lightboxCaption = t('aiCustom.detail.lightbox.caption', {
    code: aiCard.code,
    createdAt: formatDateTime(aiCard.createdAt, 'dateTimeShort')
  })
  const lightboxImages = [
    ...(aiCard.outputImageUrl
      ? [
          {
            src: aiCard.outputImageUrl,
            alt: t('aiCustom.history.previewAlt', { code: aiCard.code }),
            description: lightboxCaption
          }
        ]
      : []),
    ...aiCard.attachmentImageUrls.map((src, index) => ({
      src,
      alt: t('aiCustom.detail.attachmentAlt', { index: index + 1 }),
      description: lightboxCaption
    }))
  ]
  const rawTab = searchParams.get('tab')
  const currentTab = AI_CARD_DETAIL_TABS.includes(rawTab as (typeof AI_CARD_DETAIL_TABS)[number]) ? rawTab! : 'customer'

  const handleTabChange = (value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('tab', value)
    setSearchParams(nextSearchParams, { replace: true })
  }

  return (
    <div className='h-full overflow-auto'>
      <Tabs value={currentTab} onValueChange={handleTabChange} className='flex flex-col'>
        <div className='mx-auto w-full max-w-8xl space-y-6 px-6 pt-6'>
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

            {isFileAvailable && (
              <Button disabled={isDownloading} onClick={() => downloadAiCard(aiCard)}>
                {isDownloading ? <LoaderCircleIcon className='animate-spin' /> : <DownloadIcon />}
                {t('aiCustom.download.action')}
              </Button>
            )}
          </div>
        </div>

        <div className='mx-auto grid w-full max-w-8xl items-start gap-6 px-6 pt-2 pb-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.4fr)]'>
          <DetailPanel
            title={t('aiCustom.detail.section.result')}
            action={<span className='font-mono text-sm font-semibold'>{aiCard.code}</span>}
            contentClassName='flex flex-col justify-center'
            className='lg:sticky lg:top-6'
          >
            <AiCardOutputImage
              src={aiCard.outputImageUrl}
              alt={t('aiCustom.history.previewAlt', { code: aiCard.code })}
              openLabel={t('aiCustom.history.openPreview', { code: aiCard.code })}
              onOpen={resultImageIndex === undefined ? undefined : () => setLightboxImageIndex(resultImageIndex)}
            />
          </DetailPanel>

          <div className='min-w-0'>
            <TabsList className='w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 flex-nowrap [&::-webkit-scrollbar]:hidden'>
              {AI_CARD_DETAIL_TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className='relative flex-none shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none'
                >
                  {t(`aiCustom.detail.tab.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className='pt-4'>
              <TabsContent value='customer' className='mt-0'>
                <DetailPanel title={t('aiCustom.detail.section.customer')} contentClassName='p-0' className='max-w-4xl'>
                  <InformationCard>
                    <InformationRow label={t('aiCustom.detail.field.customerName')}>
                      {aiCard.customerName || t('aiCustom.history.walkInCustomer')}
                    </InformationRow>
                    <InformationRow label={t('aiCustom.detail.field.phone')}>
                      {aiCard.customerPhone ? (
                        <a
                          className='inline-flex items-center gap-1.5 hover:text-primary'
                          href={`tel:${aiCard.customerPhone}`}
                        >
                          <PhoneIcon className='size-3.5' />
                          {aiCard.customerPhone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </InformationRow>
                    <InformationRow label={t('aiCustom.detail.field.email')}>
                      {aiCard.customerEmail ? (
                        <a
                          className='inline-flex items-center gap-1.5 hover:text-primary wrap-break-word'
                          href={`mailto:${aiCard.customerEmail}`}
                        >
                          <MailIcon className='size-3.5' />
                          {aiCard.customerEmail}
                        </a>
                      ) : (
                        '-'
                      )}
                    </InformationRow>
                  </InformationCard>
                </DetailPanel>
              </TabsContent>

              <TabsContent value='message' className='mt-0'>
                <DetailPanel title={t('aiCustom.detail.section.message')} contentClassName='p-0' className='max-w-4xl'>
                  <InformationCard>
                    <InformationRow label={t('aiCustom.detail.field.sender')}>
                      {aiCard.senderName || '-'}
                    </InformationRow>
                    <InformationRow label={t('aiCustom.detail.field.recipient')}>
                      {aiCard.recipientName || '-'}
                    </InformationRow>
                    <InformationRow label={t('aiCustom.detail.field.greeting')}>
                      <span className='whitespace-pre-wrap font-normal'>{aiCard.greetingMessage || '-'}</span>
                    </InformationRow>
                  </InformationCard>
                </DetailPanel>
              </TabsContent>

              <TabsContent value='design' className='mt-0'>
                <div className='grid items-start gap-5 2xl:grid-cols-2'>
                  <DetailPanel title={t('aiCustom.detail.section.design')} contentClassName='p-0'>
                    <InformationCard>
                      <InformationRow label={t('aiCustom.history.column.template')}>
                        {aiCard.templateName || '-'}
                      </InformationRow>
                      <InformationRow label={t('aiCustom.history.column.size')}>
                        {aiCard.sizeName || '-'}
                      </InformationRow>
                      <InformationRow label={t('aiCustom.history.column.writingMode')}>
                        {writingModeLabel}
                      </InformationRow>
                      <InformationRow label={t('aiCustom.history.column.createdAt')}>
                        {formatDateTime(aiCard.createdAt, 'dateTimeShort')}
                      </InformationRow>
                      <InformationRow label={t('aiCustom.detail.field.fileStatus')}>
                        <Badge variant='outline'>{fileStatusLabel}</Badge>
                      </InformationRow>
                    </InformationCard>
                  </DetailPanel>

                  <DetailPanel title={t('aiCustom.detail.field.attachments')}>
                    {aiCard.attachmentImageUrls.length > 0 ? (
                      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2'>
                        {aiCard.attachmentImageUrls.map((imageUrl, index) => (
                          <button
                            key={`${imageUrl}-${index}`}
                            type='button'
                            aria-label={t('aiCustom.detail.openAttachment', { index: index + 1 })}
                            onClick={() => setLightboxImageIndex(attachmentImageStartIndex + index)}
                            className='block rounded-xl outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                          >
                            <img
                              src={imageUrl}
                              alt={t('aiCustom.detail.attachmentAlt', { index: index + 1 })}
                              loading='lazy'
                              className='aspect-square w-full rounded-xl border bg-muted/40 object-cover'
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className='flex min-h-40 items-center justify-center rounded-xl border border-dashed p-5 text-center'>
                        <p className='text-sm text-muted-foreground'>{t('aiCustom.detail.noAttachments')}</p>
                      </div>
                    )}
                  </DetailPanel>
                </div>
              </TabsContent>

              <TabsContent value='orders' className='mt-0'>
                <DetailPanel
                  title={t('aiCustom.detail.section.orders')}
                  // description={t('aiCustom.detail.ordersDescription')}
                  contentClassName='p-0'
                >
                  {aiCard.linkedOrders.length > 0 ? (
                    <div className='overflow-hidden'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='px-5'>{t('aiCustom.detail.order.code')}</TableHead>
                            <TableHead>{t('aiCustom.detail.order.status')}</TableHead>
                            <TableHead>{t('aiCustom.detail.order.createdAt')}</TableHead>
                            <TableHead className='w-16' />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiCard.linkedOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className='px-5'>
                                <Link
                                  to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${order.id}`}
                                  className='font-mono font-medium text-primary hover:underline'
                                >
                                  {order.code}
                                </Link>
                              </TableCell>
                              <TableCell>
                                {order.status === 'Paid'
                                  ? t('orders.status.paid')
                                  : order.status === 'Pending'
                                    ? t('orders.status.pending')
                                    : '-'}
                              </TableCell>
                              <TableCell>{formatDateTime(order.createdAt, 'dateTimeShort')}</TableCell>
                              <TableCell className='text-right'>
                                <Button variant='ghost' size='icon' asChild>
                                  <Link
                                    to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${order.id}`}
                                    aria-label={t('aiCustom.detail.order.open', { code: order.code })}
                                  >
                                    <ArrowUpRightIcon />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className='m-5 flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground'>
                      <PackageSearchIcon className='size-8 opacity-60' />
                      <p className='text-sm'>{t('aiCustom.detail.noOrders')}</p>
                    </div>
                  )}
                </DetailPanel>
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>

      {lightboxImages.length > 0 && (
        <Lightbox
          open={lightboxImageIndex !== null}
          close={() => setLightboxImageIndex(null)}
          index={lightboxImageIndex ?? 0}
          on={{ view: ({ index }) => setLightboxImageIndex(index) }}
          slides={lightboxImages}
          plugins={[Captions, Counter, Fullscreen, Zoom]}
          captions={{ showToggle: true, descriptionTextAlign: 'start' }}
          counter={{ separator: ' / ' }}
          zoom={{ scrollToZoom: true, maxZoomPixelRatio: 3 }}
          labels={{
            Previous: t('aiCustom.detail.lightbox.previous'),
            Next: t('aiCustom.detail.lightbox.next'),
            Close: t('aiCustom.detail.lightbox.close'),
            Lightbox: t('aiCustom.detail.lightbox.label'),
            'Photo gallery': t('aiCustom.detail.lightbox.gallery'),
            '{index} of {total}': t('aiCustom.detail.lightbox.position'),
            'Show captions': t('aiCustom.detail.lightbox.showCaptions'),
            'Hide captions': t('aiCustom.detail.lightbox.hideCaptions'),
            'Zoom in': t('aiCustom.detail.lightbox.zoomIn'),
            'Zoom out': t('aiCustom.detail.lightbox.zoomOut'),
            'Enter Fullscreen': t('aiCustom.detail.lightbox.enterFullscreen'),
            'Exit Fullscreen': t('aiCustom.detail.lightbox.exitFullscreen')
          }}
          carousel={{ finite: lightboxImages.length === 1 }}
          render={lightboxImages.length === 1 ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
        />
      )}
    </div>
  )
}
