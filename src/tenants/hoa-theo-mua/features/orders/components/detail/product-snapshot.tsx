import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, GiftIcon, ImageIcon, ImageOffIcon, MailIcon, SparklesIcon } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
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
import { InfoCard, InfoRow, SplitRow } from './parts'

const text = (value: string | null | undefined, empty: string) => value?.trim() || empty
const currency = (value: number | null | undefined, empty: string) =>
  value == null ? empty : vndFormatter.format(value)
const quantity = (value: number | null | undefined, empty: string) =>
  value == null ? empty : numberFormatter.format(value)

/**
 * Màu chỉ dùng cho thứ cần phản ứng: bản thiệp đã chốt (xanh), dữ liệu hỏng
 * hoặc ngừng bán (đỏ), việc chưa xong (vàng). Mọi thứ còn lại là xám trung tính.
 */
const POSITIVE =
  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
const NEGATIVE =
  'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400'
const PENDING =
  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400'

/** Trạng thái sinh thiệp: xong thì để trung tính, chỉ tô màu khi lỗi hoặc chưa xong. */
const statusTone = (status: string) => {
  const value = status.toLowerCase()
  if (['done', 'success', 'completed', 'validated'].includes(value)) return undefined
  if (['failed', 'error', 'rejected', 'cancelled'].includes(value)) return NEGATIVE
  return PENDING
}

/** Ô ảnh vuông dùng chung cho sản phẩm, phụ kiện và thiệp. */
function Thumbnail({
  src,
  alt,
  className,
  icon: Icon = ImageIcon
}: {
  src: string | null | undefined
  alt: string
  className?: string
  icon?: ComponentType<{ className?: string }>
}) {
  return (
    <div
      className={cn(
        'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30',
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className='size-full object-cover' />
      ) : (
        <Icon className='size-5 text-muted-foreground/50' />
      )}
    </div>
  )
}

/** Đầu mục của một nhóm nội dung: tiêu đề semibold và mô tả nhỏ bên dưới. */
export function SnapshotSection({
  title,
  description,
  action,
  bodyClassName,
  children
}: {
  title: string
  description?: string
  action?: ReactNode
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className='space-y-4'>
      <header className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h4 className='font-semibold leading-none'>{title}</h4>
          {description && <p className='text-xs leading-relaxed text-muted-foreground'>{description}</p>}
        </div>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

function Accessory({ accessory, label, t }: { accessory: SystemOrderSnapshotAccessory; label: string; t: TenantT }) {
  const empty = t('systemOrders.common.noDataShort')
  const isActive = accessory.isActive && !accessory.isDeleted
  const name = text(accessory.name, empty)

  return (
    <SplitRow
      className={cn(!isActive && 'bg-rose-50/40 dark:bg-rose-950/10')}
      leading={
        <div className='flex min-w-0 items-center gap-3'>
          <Thumbnail src={accessory.imageUrl} alt={name} icon={GiftIcon} className='size-10 bg-muted/50' />
          <div className='min-w-0 space-y-0.5'>
            <p className='text-xs text-muted-foreground'>{label}</p>
            {accessory.id ? (
              <Link
                to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${accessory.id}`}
                className='block truncate font-medium hover:text-primary hover:underline'
              >
                {name}
              </Link>
            ) : (
              <p className='truncate font-medium'>{name}</p>
            )}
          </div>
        </div>
      }
      trailing={
        <div className='flex flex-col items-end gap-1'>
          <span className='font-semibold'>{currency(accessory.price, empty)}</span>
          {/* Chỉ báo khi phụ kiện đã ngừng bán - trạng thái bình thường không cần badge. */}
          {!isActive && (
            <Badge variant='outline' className={cn('font-normal', NEGATIVE)}>
              {t('systemOrders.detail.snapshot.inactive')}
            </Badge>
          )}
        </div>
      }
    />
  )
}

/** Danh sách vật liệu: dòng Core được tô nền để tách khỏi vật liệu phụ. */
function MaterialList({
  title,
  materials,
  t
}: {
  title?: string
  materials: SystemOrderSnapshotMaterial[]
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')
  const total = materials.reduce((sum, material) => sum + (material.price ?? 0) * (material.quantity ?? 0), 0)

  return (
    <InfoCard title={title}>
      {materials.map((material, index) => (
        <SplitRow
          key={`${material.matId}-${index}`}
          className={cn(material.isCore && 'bg-muted/30')}
          leading={
            <div className='flex min-w-0 items-center gap-2'>
              {/* Vật liệu chính chỉ cần đậm hơn, không cần tô màu. */}
              {material.isCore && (
                <span className='shrink-0 text-[10px] font-semibold uppercase text-muted-foreground'>
                  {t('systemOrders.detail.snapshot.core')}
                </span>
              )}
              <Link
                to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${material.matId}`}
                className={cn('truncate hover:text-primary hover:underline', material.isCore && 'font-medium')}
              >
                {text(material.name, empty)}
              </Link>
            </div>
          }
          trailing={
            <>
              <span className='text-muted-foreground'>
                {quantity(material.quantity, empty)} × {currency(material.price, empty)}
              </span>
              <span className='ml-3 font-semibold'>
                {currency((material.price ?? 0) * (material.quantity ?? 0), empty)}
              </span>
            </>
          }
        />
      ))}
      <SplitRow
        className='bg-muted/40'
        leading={
          <span className='text-xs font-medium text-muted-foreground'>
            {t('systemOrders.detail.snapshot.materialsTotal')}
          </span>
        }
        trailing={<span className='font-bold'>{vndFormatter.format(total)}</span>}
      />
    </InfoCard>
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

/** Bản thiệp đã sinh. Bản chốt in nổi bật bằng viền xanh, các bản còn lại làm mờ. */
function CardVersionTile({ version, t }: { version: CardVersionView; t: TenantT }) {
  const label = t('systemOrders.detail.snapshot.versionLabel', { index: version.label })

  return (
    <Link
      to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-custom/cards/${version.id}`}
      className={cn(
        'block overflow-hidden rounded-lg border transition-all',
        version.isFinal
          ? 'border-emerald-400 ring-2 ring-emerald-400/40 dark:border-emerald-600'
          : 'opacity-70 grayscale hover:opacity-100 hover:grayscale-0 hover:border-primary/60'
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
        {version.isFinal && (
          <Badge className='absolute right-1.5 top-1.5 gap-1 border-transparent bg-emerald-600 px-1.5 py-0 text-[10px] font-medium text-white shadow-sm hover:bg-emerald-600'>
            <CheckIcon className='size-2.5' />
            {t('systemOrders.detail.snapshot.versionFinal')}
          </Badge>
        )}
      </div>
      <div className={cn('border-t px-2 py-1.5', version.isFinal && 'bg-emerald-50 dark:bg-emerald-950/40')}>
        <p className='text-xs font-medium'>{label}</p>
        {/* Không hiện uuid - tên bản thiệp nếu có là đủ để đối chiếu. */}
        {version.name?.trim() && <p className='truncate text-[10px] text-muted-foreground'>{version.name.trim()}</p>}
      </div>
    </Link>
  )
}

const VERSION_GRID = 'grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'

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

  const notice = isOrderDetailCardsError
    ? t('systemOrders.detail.snapshot.versionsError')
    : versions.length === 0
      ? t('systemOrders.detail.snapshot.versionsEmpty')
      : null

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <ImageIcon className='size-3.5 text-muted-foreground' />
        <p className='text-sm font-semibold text-muted-foreground'>{t('systemOrders.detail.snapshot.versionsTitle')}</p>
        <Badge variant='outline' className={cn('ml-auto font-normal', finalVersion ? POSITIVE : NEGATIVE)}>
          {status}
        </Badge>
      </div>

      {isGettingOrderDetailCards ? (
        <div className={VERSION_GRID}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='aspect-[4/5] rounded-lg' />
          ))}
        </div>
      ) : notice ? (
        <p className='rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground'>{notice}</p>
      ) : (
        <div className={VERSION_GRID}>
          {versions.map((version) => (
            <CardVersionTile key={version.id} version={version} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CardSnapshot({
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
  const maxWords = card.cardConfig?.maxWords ?? size?.maxWords
  const exceedsWordLimit = card.wordCount != null && maxWords != null && card.wordCount > maxWords

  return (
    <div className='space-y-6'>
      {/* Mẫu thiệp + trạng thái */}
      <div className='flex items-center gap-3 rounded-lg border bg-card p-3'>
        <Thumbnail
          src={card.cardTemplate?.templateImageUrl ?? card.rawImage}
          alt={text(card.cardTemplate?.templateName, 'Card')}
          icon={MailIcon}
        />
        <div className='min-w-0 flex-1 space-y-0.5'>
          <p className='text-xs text-muted-foreground'>{t('systemOrders.detail.snapshot.cardTemplate')}</p>
          <p className='truncate text-sm font-medium'>{text(card.cardTemplate?.templateName, empty)}</p>
        </div>
        <div className='flex shrink-0 flex-wrap justify-end gap-1.5'>
          {card.cardType && (
            <Badge variant='secondary' className='font-normal uppercase'>
              {card.cardType}
            </Badge>
          )}
          {card.status && (
            <Badge
              variant={statusTone(card.status) ? 'outline' : 'secondary'}
              className={cn('font-normal', statusTone(card.status))}
            >
              {card.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Thông số */}
      <InfoCard>
        <InfoRow label={t('systemOrders.detail.snapshot.cardSize')} value={text(size?.name, empty)} alignEnd />
        <InfoRow
          label={t('systemOrders.detail.snapshot.cardDimensions')}
          value={size?.width != null && size?.height != null ? `${size.width} × ${size.height}` : empty}
          alignEnd
        />
        <InfoRow
          label={t('systemOrders.detail.snapshot.cardQuantity')}
          value={quantity(card.quantity, empty)}
          alignEnd
        />
        <InfoRow label={t('systemOrders.detail.snapshot.cardForm')} value={text(card.formType, empty)} alignEnd />
        <InfoRow
          label={t('systemOrders.detail.snapshot.cardWordCount')}
          value={
            <span className={cn(exceedsWordLimit && 'font-semibold text-rose-700 dark:text-rose-400')}>
              {maxWords != null ? `${card.wordCount ?? 0} / ${maxWords}` : (card.wordCount ?? empty)}
            </span>
          }
          alignEnd
        />
        <InfoRow
          label={t('systemOrders.detail.snapshot.cardBasePrice')}
          value={currency(card.basePrice, empty)}
          alignEnd
        />
        <InfoRow
          label={t('systemOrders.detail.snapshot.cardExtraPrice')}
          value={currency(card.extraPrice, empty)}
          alignEnd
        />
        <InfoRow
          label={t('systemOrders.detail.snapshot.cardTotal')}
          value={currency(card.totalPrice, empty)}
          alignEnd
          emphasis
        />
      </InfoCard>

      {/* Lời chúc - nội dung khách viết, đáng chú ý nhất trong khối thiệp */}
      {card.messageContent?.trim() && (
        <div className='space-y-2'>
          <p className='text-sm font-semibold text-muted-foreground'>{t('systemOrders.detail.snapshot.cardMessage')}</p>
          <p className='whitespace-pre-wrap rounded-lg border-l-2 border-primary/50 bg-primary/5 px-4 py-3 text-sm leading-relaxed'>
            {card.messageContent}
          </p>
        </div>
      )}

      <CardVersions orderDetailsId={orderDetailsId} card={card} t={t} />
    </div>
  )
}

/** Một biến thể sản phẩm trong snapshot: phụ kiện, vật liệu và thiệp đi kèm. */
function ProductMetadata({
  orderDetailsId,
  metadata,
  showCard = true,
  t
}: {
  orderDetailsId: string
  metadata: SystemOrderProductMetadata
  /** Thiệp có thể được tách ra tab riêng ở nơi gọi (xem `OrderItemDialog`) - khi đó không lặp lại ở đây. */
  showCard?: boolean
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')
  const accessories = [
    metadata.ribbon && { accessory: metadata.ribbon, label: t('systemOrders.detail.snapshot.ribbon') },
    metadata.wrappingPaper && {
      accessory: metadata.wrappingPaper,
      label: t('systemOrders.detail.snapshot.wrappingPaper')
    }
  ].filter((entry) => entry != null)
  const materials = metadata.materials ?? []
  const additions = metadata.additionCustome ?? []

  const isEmpty =
    accessories.length === 0 &&
    materials.length === 0 &&
    additions.length === 0 &&
    (!showCard || !metadata.snapShotCard)

  return (
    <div className='space-y-8 py-8 first:pt-0 last:pb-0'>
      {/* Tên biến thể đứng đầu khối để tách các biến thể trong cùng một dòng đơn hàng */}
      <div className='flex flex-wrap items-center gap-2 border-l-2 border-primary/60 pl-3'>
        <p className='text-base font-semibold leading-tight'>{text(metadata.name, empty)}</p>
        {metadata.aiCustomize && (
          <Badge variant='secondary' className='gap-1 font-normal'>
            <SparklesIcon className='size-3' />
            {t('systemOrders.detail.snapshot.aiCustomize')}
          </Badge>
        )}
      </div>

      {isEmpty && (
        <p className='rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground'>
          {t('systemOrders.detail.snapshot.itemEmpty')}
        </p>
      )}

      {accessories.length > 0 && (
        <SnapshotSection
          title={t('systemOrders.detail.snapshot.accessories')}
          description={t('systemOrders.detail.snapshot.accessoriesDescription')}
        >
          <InfoCard>
            {accessories.map((entry) => (
              <Accessory key={entry.label} accessory={entry.accessory} label={entry.label} t={t} />
            ))}
          </InfoCard>
        </SnapshotSection>
      )}

      {(materials.length > 0 || additions.length > 0) && (
        <SnapshotSection
          title={t('systemOrders.detail.snapshot.materialsTitle')}
          description={t('systemOrders.detail.snapshot.materialsDescription')}
          bodyClassName='space-y-5'
        >
          {materials.length > 0 && (
            <MaterialList
              // Chỉ cần nhãn khi có thêm nhóm bổ sung, không thì trùng tên nhóm.
              title={additions.length > 0 ? t('systemOrders.detail.snapshot.materials') : undefined}
              materials={materials}
              t={t}
            />
          )}
          {additions.length > 0 && (
            <MaterialList title={t('systemOrders.detail.snapshot.additions')} materials={additions} t={t} />
          )}
        </SnapshotSection>
      )}

      {showCard && metadata.snapShotCard && (
        <SnapshotSection
          title={t('systemOrders.detail.snapshot.cardTitle')}
          description={t('systemOrders.detail.snapshot.cardDescription')}
        >
          <CardSnapshot orderDetailsId={orderDetailsId} card={metadata.snapShotCard} t={t} />
        </SnapshotSection>
      )}
    </div>
  )
}

/**
 * Toàn bộ snapshot của một dòng đơn hàng: mỗi biến thể sản phẩm là một khối,
 * dùng trong dialog chi tiết sản phẩm nên không bọc thêm card hay accordion.
 */
export function ProductSnapshotDetail({
  item,
  showCard = true,
  t
}: {
  item: SystemOrderItem
  /** Bỏ qua khi thiệp đã được hiển thị ở tab riêng (xem `OrderItemDialog`). */
  showCard?: boolean
  t: TenantT
}) {
  const metadataList = item.snapshot?.productMetadata ?? []

  if (metadataList.length === 0) {
    return (
      <div className='rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground'>
        {t('systemOrders.detail.snapshot.itemEmpty')}
      </div>
    )
  }

  return (
    <div className='divide-y'>
      {metadataList.map((metadata, index) => (
        <ProductMetadata
          key={`${item.orderDetailsId}-${index}`}
          orderDetailsId={item.orderDetailsId}
          metadata={metadata}
          showCard={showCard}
          t={t}
        />
      ))}
    </div>
  )
}
