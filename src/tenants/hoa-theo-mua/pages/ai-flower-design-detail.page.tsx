import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn, formatCurrency } from '@/shared/utils'
import { ArrowLeftIcon, ArrowUpRightIcon, MapPinIcon, PackageSearchIcon, PhoneIcon } from 'lucide-react'
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
import AiCardOutputImage from '../features/ai-custom/components/ai-card-output-image'
import { useGetAiFlowerDesignDetail } from '../features/ai-custom/hooks/use-get-ai-flower-design-detail'
import type { GeneratedFlowerMaterial } from '../features/ai-custom/types'

const DETAIL_TABS = ['overview', 'materials', 'source', 'orders'] as const

function DetailPanel({
  title,
  className,
  contentClassName,
  children
}: {
  title: string
  className?: string
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', className)}>
      <div className='border-b bg-muted/20 px-5 py-4'>
        <h2 className='font-bold'>{title}</h2>
      </div>
      <div className={cn('p-5', contentClassName)}>{children}</div>
    </section>
  )
}

function InformationRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid gap-1 border-b px-5 py-3 text-sm last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)]'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='wrap-break-word font-medium'>{children}</dd>
    </div>
  )
}

function MaterialTable({ materials }: { materials: GeneratedFlowerMaterial[] }) {
  const { t } = useTenantTranslation()

  if (materials.length === 0) {
    return <p className='p-6 text-center text-sm text-muted-foreground'>{t('aiCustom.flowerDetail.noMaterials')}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='px-5'>{t('aiCustom.flowerDetail.material.name')}</TableHead>
          <TableHead>{t('aiCustom.flowerDetail.material.quantity')}</TableHead>
          <TableHead>{t('aiCustom.flowerDetail.material.unit')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={`${material.code ?? material.name}-${material.isCore}`}>
            <TableCell className='px-5'>
              <div className='flex min-w-56 items-center gap-3'>
                <img
                  src='/images/placeholder-cover.png'
                  alt={material.name}
                  className='size-10 shrink-0 rounded-lg border bg-muted/40 object-cover'
                />
                <div className='min-w-0'>
                  <p className='truncate font-medium'>{material.name}</p>
                  <p className='truncate font-mono text-xs text-muted-foreground'>{material.code || '-'}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className='font-medium tabular-nums'>{material.quantity}</TableCell>
            <TableCell>{material.unit || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AiFlowerDesignDetailPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null)
  const { aiFlowerDesign, isGettingAiFlowerDesign } = useGetAiFlowerDesignDetail(id)
  const listPath = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/flower-designs`

  if (isGettingAiFlowerDesign) {
    return (
      <div className='space-y-6 p-6'>
        <Skeleton className='h-9 w-48' />
        <Skeleton className='h-8 w-72' />
        <div className='grid gap-6 lg:grid-cols-2'>
          <Skeleton className='aspect-[4/3] rounded-2xl' />
          <Skeleton className='h-72 rounded-2xl' />
        </div>
      </div>
    )
  }

  if (!aiFlowerDesign) {
    return (
      <div className='space-y-6 p-6'>
        <Button variant='ghost' size='sm' asChild>
          <Link to={listPath}>
            <ArrowLeftIcon data-icon='inline-start' />
            {t('aiCustom.flowerDetail.back')}
          </Link>
        </Button>
        <div className='rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground'>
          {t('aiCustom.flowerDetail.notFound')}
        </div>
      </div>
    )
  }

  const coreMaterials = aiFlowerDesign.materials.filter((material) => material.isCore)
  const supportMaterials = aiFlowerDesign.materials.filter((material) => !material.isCore)
  const resultImageIndex = aiFlowerDesign.imageUrl ? 0 : undefined
  const mockupImageIndex = aiFlowerDesign.imageUrl ? 1 : 0
  const sourceComboImageIndex =
    Number(Boolean(aiFlowerDesign.imageUrl)) + Number(Boolean(aiFlowerDesign.mockup?.imageUrl))
  const lightboxImages = [
    ...(aiFlowerDesign.imageUrl
      ? [
          {
            src: aiFlowerDesign.imageUrl,
            alt: t('aiCustom.flowerHistory.previewAlt', { code: aiFlowerDesign.generatedFlowerId }),
            description: t('aiCustom.flowerDetail.lightbox.resultCaption', {
              code: aiFlowerDesign.generatedFlowerId
            })
          }
        ]
      : []),
    ...(aiFlowerDesign.mockup?.imageUrl
      ? [
          {
            src: aiFlowerDesign.mockup.imageUrl,
            alt: t('aiCustom.flowerDetail.mockupAlt', { name: aiFlowerDesign.mockup.name }),
            description: t('aiCustom.flowerDetail.lightbox.mockupCaption', {
              code: aiFlowerDesign.mockup.name
            })
          }
        ]
      : []),
    ...(aiFlowerDesign.sourceCombo.imageCombo
      ? [
          {
            src: aiFlowerDesign.sourceCombo.imageCombo,
            alt: t('aiCustom.flowerDetail.mockupAlt', { name: aiFlowerDesign.sourceCombo.name }),
            description: t('aiCustom.flowerDetail.lightbox.mockupCaption', {
              code: aiFlowerDesign.sourceCombo.code || '-'
            })
          }
        ]
      : [])
  ]
  const rawTab = searchParams.get('tab')
  const currentTab = DETAIL_TABS.includes(rawTab as (typeof DETAIL_TABS)[number]) ? rawTab! : 'overview'

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
            <Link to={listPath}>
              <ArrowLeftIcon data-icon='inline-start' />
              {t('aiCustom.flowerDetail.back')}
            </Link>
          </Button>

          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-bold'>{t('aiCustom.flowerDetail.title')}</h1>
              <Badge variant='outline' className='font-mono'>
                {aiFlowerDesign.generatedFlowerId}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>{t('aiCustom.flowerDetail.description')}</p>
          </div>
        </div>

        <div className='mx-auto grid w-full max-w-8xl items-start gap-6 px-6 pt-2 pb-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.4fr)]'>
          <section className='w-fit max-w-full justify-self-center overflow-hidden rounded-2xl border bg-card shadow-sm lg:sticky lg:top-6'>
            <div className='relative flex w-fit max-w-full items-center justify-center bg-muted/20 p-4 pt-16'>
              <div className='absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3'>
                <Badge variant='outline' className='bg-background/90 font-mono shadow-sm backdrop-blur-sm'>
                  {aiFlowerDesign.generatedFlowerId}
                </Badge>
              </div>
              <AiCardOutputImage
                src={aiFlowerDesign.imageUrl}
                alt={t('aiCustom.flowerHistory.previewAlt', { code: aiFlowerDesign.generatedFlowerId })}
                openLabel={t('aiCustom.flowerHistory.openPreview', { code: aiFlowerDesign.generatedFlowerId })}
                onOpen={resultImageIndex === undefined ? undefined : () => setLightboxImageIndex(resultImageIndex)}
                className='w-fit max-w-full rounded-lg border-0 bg-transparent shadow-none hover:shadow-none'
                imageClassName='aspect-auto h-auto max-h-[36rem] w-auto max-w-full rounded-lg border-0 bg-transparent object-contain'
                placeholderClassName='w-[calc(100vw-3rem)] max-w-md border bg-muted/40'
                showZoomOverlay
              />
            </div>
            <div className='border-t px-4 py-3'>
              <p className='text-xs text-muted-foreground'>{t('aiCustom.flowerHistory.column.createdAt')}</p>
              <p className='text-sm font-medium'>{formatDateTime(aiFlowerDesign.createdAt, 'dateTimeShort')}</p>
            </div>
          </section>

          <div className='min-w-0'>
            <TabsList className='w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 flex-nowrap [&::-webkit-scrollbar]:hidden'>
              {DETAIL_TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className='relative flex-none shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none'
                >
                  {t(`aiCustom.flowerDetail.tab.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className='pt-4'>
              <TabsContent value='overview' className='mt-0 space-y-5'>
                <DetailPanel title={t('aiCustom.flowerDetail.section.customer')} contentClassName='p-0'>
                  <dl>
                    <InformationRow label={t('aiCustom.detail.field.customerName')}>
                      {aiFlowerDesign.nameCustomer || t('aiCustom.history.walkInCustomer')}
                    </InformationRow>
                    <InformationRow label={t('aiCustom.detail.field.phone')}>
                      {aiFlowerDesign.phoneCustomer ? (
                        <a
                          href={`tel:${aiFlowerDesign.phoneCustomer}`}
                          className='inline-flex items-center gap-1.5 hover:text-primary'
                        >
                          <PhoneIcon className='size-3.5' />
                          {aiFlowerDesign.phoneCustomer}
                        </a>
                      ) : (
                        '-'
                      )}
                    </InformationRow>
                    <InformationRow label={t('aiCustom.detail.field.address')}>
                      {aiFlowerDesign.addressCustomer ? (
                        <span className='inline-flex items-start gap-1.5'>
                          <MapPinIcon className='mt-0.5 size-3.5 shrink-0' />
                          {aiFlowerDesign.addressCustomer}
                        </span>
                      ) : (
                        '-'
                      )}
                    </InformationRow>
                  </dl>
                </DetailPanel>
              </TabsContent>

              <TabsContent value='materials' className='mt-0 space-y-5'>
                <DetailPanel title={t('aiCustom.flowerDetail.section.coreMaterials')} contentClassName='p-0'>
                  <MaterialTable materials={coreMaterials} />
                </DetailPanel>
                <DetailPanel title={t('aiCustom.flowerDetail.section.supportMaterials')} contentClassName='p-0'>
                  <MaterialTable materials={supportMaterials} />
                </DetailPanel>
              </TabsContent>

              <TabsContent value='source' className='mt-0'>
                <div className='grid items-start gap-5 xl:grid-cols-2'>
                  <DetailPanel title={t('aiCustom.flowerDetail.section.sourceCombo')} contentClassName='p-0'>
                    <div className='border-b p-5'>
                      <AiCardOutputImage
                        src={aiFlowerDesign.sourceCombo.imageCombo || '/images/placeholder-cover.png'}
                        alt={aiFlowerDesign.sourceCombo.name}
                        className='w-fit max-w-full rounded-lg border-0 bg-transparent shadow-none hover:shadow-none'
                        imageClassName='aspect-auto h-auto max-h-[36rem] w-auto max-w-full rounded-lg hover:shadow-none '
                        placeholderClassName='w-full min-w-72 border bg-muted/40'
                        onOpen={
                          aiFlowerDesign.sourceCombo.imageCombo
                            ? () => setLightboxImageIndex(sourceComboImageIndex)
                            : undefined
                        }
                        showZoomOverlay
                      />
                    </div>
                    <dl>
                      <InformationRow label={t('aiCustom.flowerDetail.combo.code')}>
                        <span className='font-mono'>{aiFlowerDesign.sourceCombo.code || '-'}</span>
                      </InformationRow>
                      <InformationRow label={t('aiCustom.flowerDetail.combo.name')}>
                        {aiFlowerDesign.sourceCombo.name}
                      </InformationRow>
                      <InformationRow label={t('aiCustom.flowerDetail.combo.information')}>
                        <span className='font-normal'>{aiFlowerDesign.sourceCombo.description || '-'}</span>
                      </InformationRow>
                    </dl>
                  </DetailPanel>

                  <DetailPanel title={t('aiCustom.flowerDetail.section.sourceMockup')}>
                    {aiFlowerDesign.mockup ? (
                      <div className='space-y-3'>
                        <AiCardOutputImage
                          className='w-fit max-w-full rounded-lg border-0 bg-transparent shadow-none hover:shadow-none'
                          imageClassName='aspect-auto h-auto max-h-[36rem] w-auto max-w-full rounded-lg hover:shadow-none '
                          placeholderClassName='w-full min-w-72 border bg-muted/40'
                          src={aiFlowerDesign.mockup.imageUrl}
                          alt={t('aiCustom.flowerDetail.mockupAlt', { name: aiFlowerDesign.mockup.name })}
                          openLabel={t('aiCustom.flowerDetail.openMockup', { name: aiFlowerDesign.mockup.name })}
                          onOpen={
                            aiFlowerDesign.mockup.imageUrl ? () => setLightboxImageIndex(mockupImageIndex) : undefined
                          }
                          showZoomOverlay
                        />
                        <div>
                          <p className='font-medium'>{aiFlowerDesign.mockup.name}</p>
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>{t('aiCustom.flowerDetail.noMockup')}</p>
                    )}
                  </DetailPanel>
                </div>
              </TabsContent>

              <TabsContent value='orders' className='mt-0'>
                <DetailPanel title={t('aiCustom.flowerDetail.section.orders')} contentClassName='p-0'>
                  {aiFlowerDesign.orders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='px-5'>{t('aiCustom.detail.order.code')}</TableHead>
                          <TableHead>{t('aiCustom.detail.order.status')}</TableHead>
                          <TableHead>{t('aiCustom.detail.order.createdAt')}</TableHead>
                          <TableHead>{t('aiCustom.detail.order.totalFee')}</TableHead>
                          <TableHead className='w-16' />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aiFlowerDesign.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className='px-5'>
                              <Link
                                to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${order.id}`}
                                className='font-mono font-medium hover:underline'
                              >
                                {order.id}
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
                            <TableCell>{formatCurrency(order.totalFee)}</TableCell>
                            <TableCell className='text-right'>
                              <Button variant='ghost' size='icon' asChild>
                                <Link
                                  to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders/${order.id}`}
                                  aria-label={t('aiCustom.detail.order.open', { code: order.id })}
                                >
                                  <ArrowUpRightIcon />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className='m-5 flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-muted-foreground'>
                      <PackageSearchIcon className='size-8 opacity-60' />
                      <p className='text-sm'>{t('aiCustom.flowerDetail.noOrders')}</p>
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
            Lightbox: t('aiCustom.flowerDetail.lightbox.label'),
            'Photo gallery': t('aiCustom.flowerDetail.lightbox.gallery'),
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
