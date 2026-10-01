import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ExternalLinkIcon, ImageOffIcon, SparklesIcon, ZoomInIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { useGetAiFlowerDesignDetail } from '../../../ai-custom/hooks/use-get-ai-flower-design-detail'
import type { GeneratedFlowerMaterial, GeneratedFlowerObservedStatus } from '../../../ai-custom/types'
import { numberFormatter } from '../../utils'
import { InfoCard, InfoRow, SplitRow } from './parts'
import { SnapshotSection } from './product-snapshot'

/** Ảnh mở được ở tab mới - trong dialog không dùng lightbox để tránh chồng lớp. */
function Figure({
  src,
  alt,
  caption,
  className,
  imageClassName
}: {
  src: string | null | undefined
  alt: string
  caption?: ReactNode
  className?: string
  imageClassName?: string
}) {
  const url = src?.trim()

  return (
    <figure className={cn('space-y-2', className)}>
      {url ? (
        <a
          href={url}
          target='_blank'
          rel='noreferrer'
          className='group relative block overflow-hidden rounded-xl border bg-muted/30 outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring'
        >
          <img src={url} alt={alt} className={cn('w-full object-contain', imageClassName)} />
          <span className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
            <span className='flex size-9 items-center justify-center rounded-full bg-background/90 shadow-md'>
              <ZoomInIcon className='size-4' />
            </span>
          </span>
        </a>
      ) : (
        <div
          role='img'
          aria-label={alt}
          className={cn(
            'flex items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground/50',
            imageClassName
          )}
        >
          <ImageOffIcon className='size-6' />
        </div>
      )}
      {caption && <figcaption className='space-y-0.5 text-sm'>{caption}</figcaption>}
    </figure>
  )
}

/** Chỉ tô đỏ khi nguồn đã ngừng bán hoặc bị xóa - bình thường thì không cần badge. */
function InactiveBadge({ status, t }: { status: GeneratedFlowerObservedStatus | null | undefined; t: TenantT }) {
  if (!status || (status.isActive && !status.isDeleted)) return null

  return (
    <Badge
      variant='outline'
      className='border-rose-200 bg-rose-50 font-normal text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400'
    >
      {t('systemOrders.detail.flower.inactive')}
    </Badge>
  )
}

function FlowerMaterialList({
  title,
  materials,
  t
}: {
  title: string
  materials: GeneratedFlowerMaterial[]
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')

  return (
    <InfoCard title={title}>
      {materials.map((material, index) => (
        <SplitRow
          key={`${material.matId}-${index}`}
          className={cn(material.isCore && 'bg-muted/30')}
          leading={
            <div className='flex min-w-0 items-center gap-2'>
              {material.coverImage && (
                <img
                  src={material.coverImage}
                  alt={material.name}
                  className='size-8 shrink-0 rounded-md border bg-muted/40 object-cover'
                />
              )}
              {material.isCore && (
                <span className='shrink-0 text-[10px] font-semibold uppercase text-muted-foreground'>
                  {t('systemOrders.detail.snapshot.core')}
                </span>
              )}
              <Link
                to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${material.matId}`}
                className={cn('truncate hover:text-primary hover:underline', material.isCore && 'font-medium')}
              >
                {material.name?.trim() || empty}
              </Link>
            </div>
          }
          trailing={
            <>
              <span className='font-semibold'>
                {material.quantity == null ? empty : numberFormatter.format(material.quantity)}
              </span>
              {material.unit?.trim() && (
                <span className='ml-1.5 text-muted-foreground'>{material.unit.trim().toLowerCase()}</span>
              )}
            </>
          }
        />
      ))}
    </InfoCard>
  )
}

/**
 * Mẫu hoa AI đã sinh cho một biến thể trong snapshot đơn hàng.
 * `generatedFlower` chỉ là id nên phải gọi thêm API mới có dữ liệu đầy đủ.
 */
export function AiFlowerSnapshot({ generatedFlowerId, t }: { generatedFlowerId: string; t: TenantT }) {
  const { aiFlowerDesign, isGettingAiFlowerDesign } = useGetAiFlowerDesignDetail(generatedFlowerId)
  const empty = t('systemOrders.common.noDataShort')

  if (isGettingAiFlowerDesign) {
    return (
      <div className='grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]'>
        <Skeleton className='aspect-square rounded-xl' />
        <div className='space-y-3'>
          <Skeleton className='h-6 w-56' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-40 w-full rounded-xl' />
        </div>
      </div>
    )
  }

  if (!aiFlowerDesign) {
    return (
      <div className='rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground'>
        {t('systemOrders.detail.flower.notFound')}
      </div>
    )
  }

  const history = aiFlowerDesign.clientHistory
  const historyMetadata = history?.metadata
  const product = historyMetadata?.product
  const bundle = historyMetadata?.bundle
  const mockup = historyMetadata?.mockup
  const materials = aiFlowerDesign.metadata?.materials ?? []
  const coreMaterials = materials.filter((material) => material.isCore)
  const supportMaterials = materials.filter((material) => !material.isCore)
  const additions = aiFlowerDesign.metadata?.AdditionCustome ?? []
  const ribbon = aiFlowerDesign.metadata?.ribbon
  const wrappingPaper = aiFlowerDesign.metadata?.wrappingPaper

  const sources = [
    product && {
      key: 'combo',
      label: t('systemOrders.detail.flower.sourceCombo'),
      name: product.name,
      description: null as string | null,
      imageUrl: product.image?.url,
      status: product.observedStatus
    },
    mockup && {
      key: 'mockup',
      label: t('systemOrders.detail.flower.sourceMockup'),
      name: mockup.name,
      description: mockup.description,
      imageUrl: mockup.image?.url,
      status: mockup.observedStatus
    },
    bundle && {
      key: 'bundle',
      label: t('systemOrders.detail.flower.bundle'),
      name: bundle.name,
      description: bundle.description,
      imageUrl: bundle.image?.url,
      status: bundle.observedStatus
    }
  ].filter((source) => source != null)

  const accessories = [
    ribbon && { key: 'ribbon', label: t('systemOrders.detail.snapshot.ribbon'), accessory: ribbon },
    wrappingPaper && {
      key: 'wrappingPaper',
      label: t('systemOrders.detail.snapshot.wrappingPaper'),
      accessory: wrappingPaper
    }
  ].filter((entry) => entry != null)

  const auditRows: { label: string; value: ReactNode }[] = [
    { label: t('systemOrders.detail.flower.operation'), value: historyMetadata?.operation?.trim() || empty },
    { label: t('systemOrders.detail.flower.schemaVersion'), value: historyMetadata?.schemaVersion ?? empty },
    {
      label: t('systemOrders.detail.flower.validatedAt'),
      value: historyMetadata?.validatedAt ? formatDateTime(historyMetadata.validatedAt, 'dateTimeShort') : empty
    },
    {
      label: t('systemOrders.detail.flower.systemPromptSource'),
      value: historyMetadata?.systemPromptSource?.trim() || empty
    }
  ]

  return (
    <div className='space-y-8'>
      {/* Ảnh kết quả + nhận dạng mẫu hoa */}
      <div className='grid items-start gap-5 border-b pb-8 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]'>
        <Figure
          src={aiFlowerDesign.imageUrl}
          alt={aiFlowerDesign.name}
          imageClassName='aspect-square max-h-72'
          className='mx-auto w-full max-w-xs sm:mx-0'
        />

        <div className='min-w-0 space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <h4 className='text-base font-semibold'>{aiFlowerDesign.name?.trim() || empty}</h4>
            {aiFlowerDesign.metadata?.aiCustomize && (
              <Badge variant='secondary' className='gap-1 font-normal'>
                <SparklesIcon className='size-3' />
                {t('systemOrders.detail.snapshot.aiCustomize')}
              </Badge>
            )}
          </div>

          <InfoCard>
            <InfoRow
              label={t('systemOrders.detail.flower.createdAt')}
              value={formatDateTime(aiFlowerDesign.createdAt, 'dateTimeShort')}
              alignEnd
            />
            <InfoRow
              label={t('systemOrders.detail.flower.materialCount')}
              value={numberFormatter.format(materials.length + additions.length)}
              alignEnd
            />
          </InfoCard>

          <Link
            to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/flower-designs/${aiFlowerDesign.id}`}
            target='_blank'
            className='inline-flex items-center gap-1 text-sm text-primary hover:underline'
          >
            {t('systemOrders.detail.flower.openDetail')}
            <ExternalLinkIcon className='size-3' />
          </Link>
        </div>
      </div>

      {/* Nguồn thiết kế: combo, mockup, bundle */}
      {sources.length > 0 && (
        <SnapshotSection
          title={t('systemOrders.detail.flower.sourceTitle')}
          description={t('systemOrders.detail.flower.sourceDescription')}
          bodyClassName='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
        >
          {sources.map((source) => (
            <Figure
              key={source.key}
              src={source.imageUrl}
              alt={source.name || source.label}
              imageClassName='aspect-[4/3]'
              caption={
                <>
                  <p className='text-xs text-muted-foreground'>{source.label}</p>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='min-w-0 truncate font-medium'>{source.name?.trim() || empty}</p>
                    <InactiveBadge status={source.status} t={t} />
                  </div>
                  {source.description?.trim() && (
                    <p className='text-xs leading-relaxed text-muted-foreground'>{source.description.trim()}</p>
                  )}
                </>
              }
            />
          ))}
        </SnapshotSection>
      )}

      {/* Phụ kiện đi kèm mẫu hoa */}
      {accessories.length > 0 && (
        <SnapshotSection
          title={t('systemOrders.detail.flower.accessories')}
          description={t('systemOrders.detail.flower.accessoriesDescription')}
        >
          <InfoCard>
            {accessories.map((entry) => (
              <SplitRow
                key={entry.key}
                leading={
                  <div className='flex min-w-0 items-center gap-3'>
                    <Figure
                      src={entry.accessory.imageUrl}
                      alt={entry.accessory.name}
                      imageClassName='size-10'
                      className='shrink-0'
                    />
                    <div className='min-w-0 space-y-0.5'>
                      <p className='text-xs text-muted-foreground'>{entry.label}</p>
                      <Link
                        to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${entry.accessory.id}`}
                        className='block truncate font-medium hover:text-primary hover:underline'
                      >
                        {entry.accessory.name?.trim() || empty}
                      </Link>
                    </div>
                  </div>
                }
                trailing={
                  <div className='flex flex-col items-end gap-1'>
                    {entry.accessory.label?.trim() && (
                      <span className='truncate text-xs text-muted-foreground'>{entry.accessory.label.trim()}</span>
                    )}
                    <InactiveBadge
                      status={{ isActive: entry.accessory.isActive, isDeleted: entry.accessory.isDeleted }}
                      t={t}
                    />
                  </div>
                }
              />
            ))}
          </InfoCard>
        </SnapshotSection>
      )}

      {/* Vật liệu tại thời điểm sinh mẫu */}
      {(materials.length > 0 || additions.length > 0) && (
        <SnapshotSection
          title={t('systemOrders.detail.flower.materials')}
          description={t('systemOrders.detail.flower.materialsDescription')}
          bodyClassName='space-y-5'
        >
          {coreMaterials.length > 0 && (
            <FlowerMaterialList title={t('systemOrders.detail.flower.coreMaterials')} materials={coreMaterials} t={t} />
          )}
          {supportMaterials.length > 0 && (
            <FlowerMaterialList
              title={t('systemOrders.detail.flower.supportMaterials')}
              materials={supportMaterials}
              t={t}
            />
          )}
          {additions.length > 0 && (
            <FlowerMaterialList title={t('systemOrders.detail.flower.additions')} materials={additions} t={t} />
          )}
        </SnapshotSection>
      )}

      <SnapshotSection
        title={t('systemOrders.detail.flower.audit')}
        description={t('systemOrders.detail.flower.auditDescription')}
      >
        <InfoCard>
          {auditRows.map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} alignEnd />
          ))}
        </InfoCard>
      </SnapshotSection>
    </div>
  )
}
