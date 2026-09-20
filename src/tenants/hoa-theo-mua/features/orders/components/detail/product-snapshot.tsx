import { Badge } from '@/components/ui/badge'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { ImageIcon, PackageIcon } from 'lucide-react'
import type {
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

function CardSnapshot({ card, t }: { card: SystemOrderSnapshotCard; t: TenantT }) {
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
    </div>
  )
}

type SnapshotSection = 'accessories' | 'materials' | 'card'

function MetadataCard({
  metadata,
  section,
  t
}: {
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
      {section === 'card' && metadata.snapShotCard && <CardSnapshot card={metadata.snapShotCard} t={t} />}
    </div>
  )
}

function SnapshotSection({ items, section, t }: { items: SystemOrderItem[]; section: SnapshotSection; t: TenantT }) {
  return (
    <div className='space-y-4'>
      {items.map((item) => (
        <div key={item.orderDetailsId} className='grid gap-4'>
          {item.snapshot?.productMetadata?.map((metadata, index) => (
            <MetadataCard key={`${item.orderDetailsId}-${index}`} metadata={metadata} section={section} t={t} />
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
