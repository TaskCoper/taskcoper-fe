import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  GiftIcon,
  ImageIcon,
  ImageOffIcon,
  MailIcon,
  PackageIcon,
  SparklesIcon
} from 'lucide-react'
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

/** Nhóm nội dung phẳng, tách bằng nhịp và chữ thay vì thêm một lớp card. */
function Section({
  icon: Icon,
  title,
  count,
  bodyClassName,
  children
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  count?: number
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className='space-y-3'>
      <header className='flex flex-wrap items-center gap-2'>
        <Icon className='size-4 text-muted-foreground' />
        <h4 className='text-sm font-semibold'>{title}</h4>
        {count != null && (
          <Badge variant='secondary' className='h-5 min-w-5 px-1.5 text-[10px] font-medium tabular-nums'>
            {count}
          </Badge>
        )}
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
    <div
      className={cn(
        'flex items-center gap-3 py-1',
        !isActive && 'border-l-2 border-rose-400 bg-rose-50/40 pl-3 dark:border-rose-700 dark:bg-rose-950/10'
      )}
    >
      <Thumbnail src={accessory.imageUrl} alt={name} icon={GiftIcon} className='bg-muted/50' />
      <div className='min-w-0 flex-1 space-y-1'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        {accessory.id ? (
          <Link
            to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${accessory.id}`}
            className='block truncate text-sm font-medium hover:text-primary hover:underline'
          >
            {name}
          </Link>
        ) : (
          <p className='truncate text-sm font-medium'>{name}</p>
        )}
      </div>
      <div className='flex shrink-0 flex-col items-end gap-1.5'>
        <span className='text-sm font-semibold tabular-nums'>{currency(accessory.price, empty)}</span>
        {/* Chỉ báo khi phụ kiện đã ngừng bán - trạng thái bình thường không cần badge. */}
        {!isActive && (
          <Badge variant='outline' className={cn('font-normal', NEGATIVE)}>
            {t('systemOrders.detail.snapshot.inactive')}
          </Badge>
        )}
      </div>
    </div>
  )
}

/** Bảng vật liệu: dòng Core được tô nền để tách khỏi vật liệu phụ. */
function MaterialTable({
  title,
  materials,
  t
}: {
  title: string
  materials: SystemOrderSnapshotMaterial[]
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')
  const total = materials.reduce((sum, material) => sum + (material.price ?? 0) * (material.quantity ?? 0), 0)

  return (
    <div className='min-w-0'>
      <p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>{title}</p>
      <div className='overflow-x-auto'>
        <Table className='min-w-[520px]'>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-9 text-xs'>{t('systemOrders.detail.materials')}</TableHead>
              <TableHead className='h-9 w-16 text-right text-xs'>{t('systemOrders.detail.itemQuantity')}</TableHead>
              <TableHead className='h-9 w-28 text-right text-xs'>{t('systemOrders.detail.itemPrice')}</TableHead>
              <TableHead className='h-9 w-28 text-right text-xs'>{t('systemOrders.detail.itemTotal')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material, index) => (
              <TableRow key={`${material.matId}-${index}`} className={cn(material.isCore && 'bg-muted/40')}>
                <TableCell className='py-2 text-sm'>
                  <div className='flex items-center gap-2'>
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
                </TableCell>
                <TableCell className='py-2 text-right text-sm font-medium tabular-nums'>
                  {quantity(material.quantity, empty)}
                </TableCell>
                <TableCell className='py-2 text-right text-sm tabular-nums text-muted-foreground'>
                  {currency(material.price, empty)}
                </TableCell>
                <TableCell className='py-2 text-right text-sm font-medium tabular-nums'>
                  {currency((material.price ?? 0) * (material.quantity ?? 0), empty)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className='hover:bg-transparent'>
              <TableCell colSpan={3} className='py-2 text-xs font-medium text-muted-foreground'>
                {t('systemOrders.detail.snapshot.materialsTotal')}
              </TableCell>
              <TableCell className='py-2 text-right text-sm font-bold tabular-nums'>
                {vndFormatter.format(total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
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
        <p className='truncate font-mono text-[10px] text-muted-foreground'>{version.name?.trim() || version.id}</p>
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
    <div className='space-y-4 border-t pt-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <ImageIcon className='size-4 text-muted-foreground' />
        <p className='text-sm font-medium'>{t('systemOrders.detail.snapshot.versionsTitle')}</p>
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
        <p className='py-4 text-center text-sm text-muted-foreground'>{notice}</p>
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

/** Một ô nhãn/giá trị trong lưới thông số thiệp. */
function CardStat({
  label,
  value,
  emphasis = 'default'
}: {
  label: string
  value: ReactNode
  emphasis?: 'default' | 'total' | 'attention'
}) {
  return (
    <div
      className={cn(
        'min-w-0 space-y-0.5',
        emphasis === 'total' && 'bg-primary/5 px-2.5 py-2',
        emphasis === 'attention' && 'bg-rose-50 px-2.5 py-2 dark:bg-rose-950/30'
      )}
    >
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p
        className={cn(
          'truncate text-sm font-medium tabular-nums',
          emphasis === 'total' && 'text-base font-bold text-primary',
          emphasis === 'attention' && 'font-semibold text-rose-700 dark:text-rose-400'
        )}
      >
        {value}
      </p>
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
  const maxWords = card.cardConfig?.maxWords ?? size?.maxWords
  const prompt = card.systemPrompt?.content?.trim()
  const exceedsWordLimit = card.wordCount != null && maxWords != null && card.wordCount > maxWords

  return (
    <div className='overflow-hidden'>
      {/* Mẫu thiệp + trạng thái */}
      <div className='flex items-center gap-3 pb-4'>
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
      <div className='grid gap-x-8 gap-y-5 border-t py-5 sm:grid-cols-3 lg:grid-cols-4'>
        <CardStat label={t('systemOrders.detail.snapshot.cardSize')} value={text(size?.name, empty)} />
        <CardStat
          label={t('systemOrders.detail.snapshot.cardDimensions')}
          value={size?.width != null && size?.height != null ? `${size.width} × ${size.height}` : empty}
        />
        <CardStat label={t('systemOrders.detail.snapshot.cardQuantity')} value={quantity(card.quantity, empty)} />
        <CardStat label={t('systemOrders.detail.snapshot.cardForm')} value={text(card.formType, empty)} />
        <CardStat
          label={t('systemOrders.detail.snapshot.cardWordCount')}
          value={maxWords != null ? `${card.wordCount ?? 0} / ${maxWords}` : (card.wordCount ?? empty)}
          emphasis={exceedsWordLimit ? 'attention' : 'default'}
        />
        <CardStat label={t('systemOrders.detail.snapshot.cardBasePrice')} value={currency(card.basePrice, empty)} />
        <CardStat label={t('systemOrders.detail.snapshot.cardExtraPrice')} value={currency(card.extraPrice, empty)} />
        <CardStat
          label={t('systemOrders.detail.snapshot.cardTotal')}
          value={currency(card.totalPrice, empty)}
          emphasis='total'
        />
      </div>

      {/* Lời chúc - nội dung khách viết, đáng chú ý nhất trong khối thiệp */}
      {card.messageContent?.trim() && (
        <div className='border-t py-5'>
          <p className='mb-2 text-xs text-muted-foreground'>{t('systemOrders.detail.snapshot.cardMessage')}</p>
          <p className='whitespace-pre-wrap bg-muted/40 px-4 py-3 text-sm leading-relaxed rounded-lg'>
            {card.messageContent}
          </p>
        </div>
      )}

      {/* Prompt AI - dài nên mặc định thu gọn */}
      {prompt && (
        <Collapsible className='border-t'>
          <CollapsibleTrigger className='flex w-full cursor-pointer items-center justify-between gap-2 py-5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&[data-state=open]>svg]:rotate-180'>
            {t('systemOrders.detail.snapshot.cardPrompt')}
            <ChevronDownIcon className='size-4 transition-transform' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className='whitespace-pre-wrap pb-5 text-sm leading-relaxed text-muted-foreground'>{prompt}</p>
          </CollapsibleContent>
        </Collapsible>
      )}

      <CardVersions orderDetailsId={orderDetailsId} card={card} t={t} />
    </div>
  )
}

/** Một biến thể sản phẩm trong snapshot: phụ kiện, vật liệu và thiệp đi kèm. */
function ProductMetadata({
  orderDetailsId,
  metadata,
  t
}: {
  orderDetailsId: string
  metadata: SystemOrderProductMetadata
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

  const isEmpty = accessories.length === 0 && materials.length === 0 && additions.length === 0 && !metadata.snapShotCard

  return (
    <div className='space-y-7 py-7 first:pt-0 last:pb-0'>
      <div className='flex flex-wrap items-center gap-2'>
        <p className='text-base font-semibold'>{text(metadata.name, empty)}</p>
        {metadata.aiCustomize && (
          <Badge variant='secondary' className='gap-1 font-normal'>
            <SparklesIcon className='size-3' />
            {t('systemOrders.detail.snapshot.aiCustomize')}
          </Badge>
        )}
      </div>

      {isEmpty && <p className='text-sm text-muted-foreground'>{t('systemOrders.detail.snapshot.itemEmpty')}</p>}

      {accessories.length > 0 && (
        <Section
          icon={GiftIcon}
          title={t('systemOrders.detail.snapshot.accessories')}
          bodyClassName='grid gap-x-8 gap-y-4 md:grid-cols-2'
        >
          {accessories.map((entry) => (
            <Accessory key={entry.label} accessory={entry.accessory} label={entry.label} t={t} />
          ))}
        </Section>
      )}

      {(materials.length > 0 || additions.length > 0) && (
        <Section
          icon={PackageIcon}
          title={t('systemOrders.detail.snapshot.materialsTitle')}
          count={materials.length + additions.length}
          bodyClassName='space-y-6'
        >
          {materials.length > 0 && (
            <MaterialTable title={t('systemOrders.detail.snapshot.materials')} materials={materials} t={t} />
          )}
          {additions.length > 0 && (
            <MaterialTable title={t('systemOrders.detail.snapshot.additions')} materials={additions} t={t} />
          )}
        </Section>
      )}

      {metadata.snapShotCard && (
        <Section icon={MailIcon} title={t('systemOrders.detail.snapshot.cardTitle')}>
          <CardSnapshot orderDetailsId={orderDetailsId} card={metadata.snapShotCard} t={t} />
        </Section>
      )}
    </div>
  )
}

function SnapshotItem({ item, t }: { item: SystemOrderItem; t: TenantT }) {
  const empty = t('systemOrders.common.noDataShort')
  const name = text(item.name, empty)
  const metadataList = item.snapshot?.productMetadata ?? []

  const accessoryCount = metadataList.reduce(
    (sum, metadata) => sum + (metadata.ribbon ? 1 : 0) + (metadata.wrappingPaper ? 1 : 0),
    0
  )
  const materialCount = metadataList.reduce(
    (sum, metadata) => sum + (metadata.materials?.length ?? 0) + (metadata.additionCustome?.length ?? 0),
    0
  )
  const hasCard = metadataList.some((metadata) => metadata.snapShotCard)

  return (
    <AccordionItem value={item.orderDetailsId} className='overflow-hidden rounded-lg border bg-card last:border-b'>
      <AccordionTrigger className='gap-4 pl-2 py-2 pr-4 hover:no-underline data-[state=open]:border-b'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <Thumbnail src={item.coverImage} alt={name} icon={PackageIcon} className='size-12' />

          <div className='min-w-0 flex-1 text-left'>
            <p className='truncate text-base font-semibold'>{name}</p>

            <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
              {item.itemId != null && <span className='font-mono'>#{item.itemId}</span>}

              {accessoryCount > 0 && (
                <span className='inline-flex items-center gap-1'>
                  <GiftIcon className='size-3' />
                  {accessoryCount}
                </span>
              )}

              {materialCount > 0 && (
                <span className='inline-flex items-center gap-1'>
                  <PackageIcon className='size-3' />
                  {materialCount}
                </span>
              )}
              {hasCard && (
                <span className='inline-flex items-center gap-1'>
                  <MailIcon className='size-3' />
                  {t('systemOrders.detail.snapshot.card')}
                </span>
              )}
            </div>
          </div>

          <div className='shrink-0 text-right'>
            <p className='text-base font-semibold tabular-nums'>
              {item.price != null && item.number != null ? currency(item.price * item.number, empty) : empty}
            </p>
            <p className='text-xs tabular-nums text-muted-foreground'>
              {quantity(item.number, empty)} × {currency(item.price, empty)}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className='space-y-5 px-5 pb-6 pt-4'>
        <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
          {item.parentProductName?.trim() && (
            <span>
              {t('systemOrders.detail.itemParent')}:{' '}
              <span className='font-medium'>{item.parentProductName.trim()}</span>
            </span>
          )}
          {item.productId && (
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${item.productId}`}
              className='ml-auto inline-flex items-center gap-1 text-primary hover:underline'
            >
              {t('systemOrders.detail.snapshot.openProduct')}
              <ExternalLinkIcon className='size-3' />
            </Link>
          )}
        </div>

        <div className='divide-y'>
          {metadataList.map((metadata, index) => (
            <ProductMetadata
              key={`${item.orderDetailsId}-${index}`}
              orderDetailsId={item.orderDetailsId}
              metadata={metadata}
              t={t}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
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
    <Accordion type='multiple' defaultValue={[snapshotItems[0].orderDetailsId]} className='space-y-2'>
      {snapshotItems.map((item) => (
        <SnapshotItem key={item.orderDetailsId} item={item} t={t} />
      ))}
    </Accordion>
  )
}
