import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, ImageIcon, ImageOffIcon, PackageIcon } from 'lucide-react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { useGetOrderDetailCards } from '../../hooks/use-get-order-detail-cards'
import type {
  SystemOrderDetailCard,
  SystemOrderItem,
  SystemOrderProductMetadata,
  SystemOrderSnapshotAccessory,
  SystemOrderSnapshotCard,
  SystemOrderSnapshotMaterial
} from '../../types'
import { numberFormatter, vndFormatter } from '../../utils'
import { DetailSection } from './parts'

const text = (value: string | null | undefined, empty: string) => value?.trim() || empty
const currency = (value: number | null | undefined, empty: string) =>
  value == null ? empty : vndFormatter.format(value)

function SnapshotImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  return (
    <div className='flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
      {src ? (
        <img src={src} alt={alt} className='size-full object-cover' />
      ) : (
        <ImageIcon className='size-5 text-muted-foreground/50' />
      )}
    </div>
  )
}

function Accessory({ accessory, label, t }: { accessory: SystemOrderSnapshotAccessory; label: string; t: TenantT }) {
  const empty = t('systemOrders.common.noDataShort')
  const isActive = accessory.isActive && !accessory.isDeleted

  return (
    <div className='flex items-center gap-3 rounded-lg border p-3'>
      <SnapshotImage src={accessory.imageUrl} alt={text(accessory.name, label)} />
      <div className='min-w-0 space-y-1'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='truncate text-sm font-medium'>{text(accessory.name, empty)}</p>
        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
          <span>{text(accessory.label, empty)}</span>
          <Badge variant={isActive ? 'default' : 'secondary'} className='font-normal'>
            {isActive ? t('systemOrders.detail.snapshot.active') : t('systemOrders.detail.snapshot.inactive')}
          </Badge>
          <span>{currency(accessory.price, empty)}</span>
        </div>
      </div>
    </div>
  )
}

function MaterialList({
  title,
  materials,
  t
}: {
  title: string
  materials: SystemOrderSnapshotMaterial[]
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')

  return (
    <div className='rounded-lg border'>
      <div className='border-b bg-muted/30 px-3 py-2 text-sm font-medium'>{title}</div>
      <div className='divide-y'>
        {materials.map((material, index) => (
          <div key={`${material.name}-${index}`} className='flex items-center justify-between gap-3 px-3 py-2 text-sm'>
            <span className='min-w-0 truncate'>{text(material.name, empty)}</span>
            <span className='shrink-0 text-muted-foreground'>
              {numberFormatter.format(material.quantity ?? 0)} × {currency(material.price, empty)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CardVersionView {
  id: string
  /** Số thứ tự bản, đánh theo đúng thứ tự API trả về. */
  label: number
  name: string | null
  imageUrl: string | null
  isFinal: boolean
}

const toCardVersions = (cards: SystemOrderDetailCard[], card: SystemOrderSnapshotCard): CardVersionView[] => {
  const generated = cards.map((item, index) => ({
    id: item.id,
    label: index + 1,
    name: item.name,
    imageUrl: item.imageUrl
  }))

  const seen = new Set(generated.map((version) => version.id))
  const missing: Omit<CardVersionView, 'isFinal'>[] = []

  for (const id of card.idResult ?? []) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    missing.push({ id, label: generated.length + missing.length + 1, name: null, imageUrl: null })
  }

  return [...generated, ...missing].map((version) => ({
    ...version,
    isFinal: !!card.finalGeneratedCardId && version.id === card.finalGeneratedCardId
  }))
}

function CardVersionTile({ version, t }: { version: CardVersionView; t: TenantT }) {
  const label = t('systemOrders.detail.snapshot.versionLabel', { index: version.label })

  return (
    <Link
      to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards/${version.id}`}
      className={cn(
        'block overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/60',
        version.isFinal ? 'border-primary ring-2 ring-primary/30' : 'opacity-90 hover:opacity-100'
      )}
    >
      <div className='relative flex aspect-square items-center justify-center bg-muted/30'>
        {version.imageUrl ? (
          <img src={version.imageUrl} alt={label} className='size-full object-contain' />
        ) : (
          <div className='flex flex-col items-center gap-1 px-2 text-center text-muted-foreground/60'>
            <ImageOffIcon className='size-4' />
            <span className='text-[10px] leading-tight'>{t('systemOrders.detail.snapshot.versionMissing')}</span>
          </div>
        )}
        <Badge
          variant={version.isFinal ? 'default' : 'secondary'}
          className='absolute right-1.5 top-1.5 gap-1 px-1.5 py-0 text-[10px] font-normal shadow-sm'
        >
          {version.isFinal && <CheckIcon className='size-2.5' />}
          {version.isFinal
            ? t('systemOrders.detail.snapshot.versionFinal')
            : t('systemOrders.detail.snapshot.versionNotChosen')}
        </Badge>
      </div>
      <div className='border-t px-2 py-1.5'>
        <p className='text-xs font-medium'>{label}</p>
        <p className='truncate font-mono text-[10px] text-muted-foreground'>{version.name?.trim() || version.id}</p>
      </div>
    </Link>
  )
}

function CardVersions({
  orderDetailsId,
  card,
  t
}: {
  orderDetailsId: string
  card: SystemOrderSnapshotCard
  t: TenantT
}) {
  const { orderDetailCards, isGettingOrderDetailCards, isOrderDetailCardsError } = useGetOrderDetailCards({
    orderDetailsId,
    virtualId: card.virtualId ?? undefined
  })

  // Thiệp đặt trước khi có studio AI không có `virtualId` lẫn id bản sinh nào - không có gì để đối chiếu.
  if (!card.virtualId && !card.finalGeneratedCardId && !(card.idResult?.length ?? 0)) return null

  const versions = toCardVersions(orderDetailCards ?? [], card)
  const finalVersion = versions.find((version) => version.isFinal)

  const status = finalVersion
    ? t('systemOrders.detail.snapshot.versionsChosen', { index: finalVersion.label })
    : card.finalGeneratedCardId
      ? t('systemOrders.detail.snapshot.versionsChosenMissing')
      : t('systemOrders.detail.snapshot.versionsNoFinal')

  return (
    <div className='space-y-3 border-t pt-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <p className='text-sm font-medium'>{t('systemOrders.detail.snapshot.versionsTitle')}</p>
        {versions.length > 0 && (
          <Badge variant='secondary' className='font-normal'>
            {versions.length}
          </Badge>
        )}
        <Badge
          variant={finalVersion ? 'default' : 'outline'}
          className={cn('font-normal', !finalVersion && 'text-muted-foreground')}
        >
          {status}
        </Badge>
      </div>

      {isGettingOrderDetailCards ? (
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='aspect-[4/5] rounded-lg' />
          ))}
        </div>
      ) : isOrderDetailCardsError ? (
        <p className='rounded-lg border py-4 text-center text-sm text-muted-foreground'>
          {t('systemOrders.detail.snapshot.versionsError')}
        </p>
      ) : versions.length === 0 ? (
        <p className='rounded-lg border py-4 text-center text-sm text-muted-foreground'>
          {t('systemOrders.detail.snapshot.versionsEmpty')}
        </p>
      ) : (
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
          {versions.map((version) => (
            <CardVersionTile key={version.id} version={version} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function CardSnapshot({
  orderDetailsId,
  card,
  t
}: {
  orderDetailsId: string
  card: SystemOrderSnapshotCard
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')
  const size = card.cardSize

  return (
    <div className='space-y-3 rounded-lg border p-3'>
      <div className='flex items-start gap-3'>
        <SnapshotImage src={card.cardTemplate?.templateImageUrl} alt={text(card.cardTemplate?.templateName, 'Card')} />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='font-medium'>{t('systemOrders.detail.snapshot.card')}</p>
            {card.status && (
              <Badge variant='secondary' className='font-normal'>
                {card.status}
              </Badge>
            )}
          </div>
          <p className='text-sm text-muted-foreground'>{text(card.cardTemplate?.templateName, empty)}</p>
          <p className='text-xs text-muted-foreground'>{text(card.formType, empty)}</p>
        </div>
      </div>
      <div className='grid gap-2 text-sm sm:grid-cols-2'>
        <div>
          <span className='text-muted-foreground'>{t('systemOrders.detail.snapshot.cardSize')}: </span>
          {text(size?.name, empty)}
        </div>
        <div>
          <span className='text-muted-foreground'>{t('systemOrders.detail.snapshot.cardDimensions')}: </span>
          {size?.width ?? empty} × {size?.height ?? empty}
        </div>
        <div>
          <span className='text-muted-foreground'>{t('systemOrders.detail.snapshot.cardQuantity')}: </span>
          {size?.name ? numberFormatter.format(card.quantity ?? 0) : empty}
        </div>
        <div>
          <span className='text-muted-foreground'>{t('systemOrders.detail.snapshot.cardWordCount')}: </span>
          {card.wordCount ?? empty}
        </div>
        <div>
          <span className='text-muted-foreground'>{t('systemOrders.detail.snapshot.cardTotal')}: </span>
          {currency(card.totalPrice, empty)}
        </div>
      </div>
      {card.messageContent && (
        <div className='rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap'>{card.messageContent}</div>
      )}
      <CardVersions orderDetailsId={orderDetailsId} card={card} t={t} />
    </div>
  )
}

type SnapshotSection = 'accessories' | 'materials' | 'card'

function MetadataCard({
  orderDetailsId,
  metadata,
  section,
  t
}: {
  orderDetailsId: string
  metadata: SystemOrderProductMetadata
  section: SnapshotSection
  t: TenantT
}) {
  const materials = metadata.materials ?? []
  const additions = metadata.additionCustome ?? []

  return (
    <div className='space-y-4'>
      {section === 'accessories' && (metadata.ribbon || metadata.wrappingPaper) && (
        <div className='grid gap-3 md:grid-cols-2'>
          {metadata.ribbon && (
            <Accessory accessory={metadata.ribbon} label={t('systemOrders.detail.snapshot.ribbon')} t={t} />
          )}
          {metadata.wrappingPaper && (
            <Accessory
              accessory={metadata.wrappingPaper}
              label={t('systemOrders.detail.snapshot.wrappingPaper')}
              t={t}
            />
          )}
        </div>
      )}
      {section === 'materials' && materials.length > 0 && (
        <MaterialList title={t('systemOrders.detail.snapshot.materials')} materials={materials} t={t} />
      )}
      {section === 'materials' && additions.length > 0 && (
        <MaterialList title={t('systemOrders.detail.snapshot.additions')} materials={additions} t={t} />
      )}
      {section === 'card' && metadata.snapShotCard && (
        <CardSnapshot orderDetailsId={orderDetailsId} card={metadata.snapShotCard} t={t} />
      )}
    </div>
  )
}

function SnapshotSection({ items, section, t }: { items: SystemOrderItem[]; section: SnapshotSection; t: TenantT }) {
  return (
    <div className='space-y-4'>
      {items.map((item) => (
        <div key={item.orderDetailsId} className='grid gap-4'>
          {item.snapshot?.productMetadata?.map((metadata, index) => (
            <MetadataCard
              key={`${item.orderDetailsId}-${index}`}
              orderDetailsId={item.orderDetailsId}
              metadata={metadata}
              section={section}
              t={t}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function SnapshotItemHeader({ item, t }: { item: SystemOrderItem; t: TenantT }) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <PackageIcon className='size-4 text-muted-foreground' />
      <h3 className='font-semibold'>{item.name || t('systemOrders.common.noDataShort')}</h3>
      <Badge variant='secondary' className='font-normal'>
        × {item.number ?? 0}
      </Badge>
      {item.snapshot?.productMetadata?.map((metadata, index) => (
        <Badge key={`${item.orderDetailsId}-name-${index}`} variant='outline' className='font-normal'>
          {metadata.name || t('systemOrders.common.noDataShort')}
        </Badge>
      ))}
    </div>
  )
}

function SnapshotItemSections({ item, t }: { item: SystemOrderItem; t: TenantT }) {
  return (
    <div className='space-y-8'>
      <SnapshotItemHeader item={item} t={t} />
      <DetailSection
        title={t('systemOrders.detail.snapshot.accessoriesTitle')}
        description={t('systemOrders.detail.snapshot.accessoriesDescription')}
      >
        <SnapshotSection items={[item]} section='accessories' t={t} />
      </DetailSection>
      <DetailSection
        title={t('systemOrders.detail.snapshot.materialsTitle')}
        description={t('systemOrders.detail.snapshot.materialsDescription')}
      >
        <SnapshotSection items={[item]} section='materials' t={t} />
      </DetailSection>
      <DetailSection
        title={t('systemOrders.detail.snapshot.cardTitle')}
        description={t('systemOrders.detail.snapshot.cardDescription')}
      >
        <SnapshotSection items={[item]} section='card' t={t} />
      </DetailSection>
    </div>
  )
}

export function ProductSnapshot({ items, t }: { items: SystemOrderItem[]; t: TenantT }) {
  const snapshotItems = items.filter((item) => (item.snapshot?.productMetadata?.length ?? 0) > 0)

  if (snapshotItems.length === 0) {
    return (
      <div className='rounded-lg border py-8 text-center text-sm text-muted-foreground'>
        {t('systemOrders.detail.snapshot.empty')}
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {snapshotItems.map((item) => (
        <SnapshotItemSections key={item.orderDetailsId} item={item} t={t} />
      ))}
    </div>
  )
}
