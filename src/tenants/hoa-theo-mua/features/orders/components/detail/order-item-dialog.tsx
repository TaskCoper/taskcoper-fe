import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { ExternalLinkIcon, MailIcon, PackageIcon, SparklesIcon, ZoomInIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import type { SystemOrderItem } from '../../types'
import { numberFormatter, vndFormatter } from '../../utils'
import { AiFlowerSnapshot } from './ai-flower-snapshot'
import { InfoCard, InfoRow } from './parts'
import { CardSnapshot, ProductSnapshotDetail } from './product-snapshot'

const TAB_TRIGGER_CLASS =
  'relative flex-none shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none'

/**
 * Toàn bộ dữ liệu của một dòng đơn hàng: thông số, snapshot lúc đặt và mẫu hoa AI.
 * Mẫu hoa AI chỉ được lưu dưới dạng id nên tab đó tự gọi thêm API.
 */
export default function OrderItemDialog({
  item,
  open,
  onOpenChange,
  t
}: {
  item: SystemOrderItem
  open: boolean
  onOpenChange: (open: boolean) => void
  t: TenantT
}) {
  const empty = t('systemOrders.common.noDataShort')
  const text = (value: string | null | undefined) => value?.trim() || empty
  const currency = (value: number | null | undefined) => (value == null ? empty : vndFormatter.format(value))
  const amount = (value: number | null | undefined) => (value == null ? empty : numberFormatter.format(value))

  const metadataList = item.snapshot?.productMetadata ?? []
  // Thiệp và mẫu hoa AI của cùng một biến thể chỉ liên hệ với nhau qua việc nằm chung
  // một phần tử `productMetadata`. Tên biến thể có thể trùng nhau khi số lượng > 1
  // (cùng một sản phẩm lặp lại nhiều lần), nên dùng thứ tự (order) làm mốc đối chiếu chắc chắn.
  const variants = metadataList.map((metadata, index) => ({
    key: `${item.orderDetailsId}-${index}`,
    order: index + 1,
    name: metadata.name?.trim() || null,
    card: metadata.snapShotCard,
    flowerId: metadata.generatedFlower?.trim() || null
  }))
  const cards = variants.flatMap((variant) => (variant.card ? [{ ...variant, card: variant.card }] : []))
  const flowers = variants.flatMap((variant) => (variant.flowerId ? [{ ...variant, flowerId: variant.flowerId }] : []))

  const tabs = [
    { value: 'info', label: t('systemOrders.detail.item.tab.info') },
    { value: 'snapshot', label: t('systemOrders.detail.item.tab.snapshot') },
    ...(cards.length > 0 ? [{ value: 'card', label: t('systemOrders.detail.item.tab.card') }] : []),
    ...(flowers.length > 0 ? [{ value: 'flower', label: t('systemOrders.detail.item.tab.flower') }] : [])
  ]
  const [tab, setTab] = useState('info')

  const name = text(item.name)
  const lineTotal = item.price != null && item.number != null ? item.price * item.number : null
  const dimensions =
    item.length != null || item.width != null || item.height != null
      ? [item.length, item.width, item.height].map((value) => (value == null ? empty : amount(value))).join(' × ')
      : empty
  const hasAiCustomize = metadataList.some((metadata) => metadata.aiCustomize)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        position='top-center'
        className='flex max-h-[calc(100vh-3rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl'
      >
        <Tabs value={tab} onValueChange={setTab} className='flex min-h-0 flex-1 flex-col gap-0'>
          <DialogHeader className='shrink-0 gap-0 border-b px-5 pt-5 text-left'>
            <div className='flex items-start gap-3 pr-10'>
              {item.coverImage ? (
                // Mở ảnh gốc ở tab mới - trong dialog không dùng lightbox để tránh chồng lớp.
                <a
                  href={item.coverImage}
                  target='_blank'
                  rel='noreferrer'
                  className='group relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring'
                >
                  <img src={item.coverImage} alt={name} className='size-full object-cover' />
                  <span className='absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>
                    <ZoomInIcon className='size-4' />
                  </span>
                </a>
              ) : (
                <span className='flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
                  <PackageIcon className='size-5 text-muted-foreground/50' />
                </span>
              )}

              <div className='min-w-0 flex-1 space-y-1'>
                <DialogTitle className='truncate text-base leading-snug'>{name}</DialogTitle>
                <DialogDescription className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
                  {item.itemId != null && <span className='font-mono'>#{item.itemId}</span>}
                  {item.parentProductName?.trim() && <span>{item.parentProductName.trim()}</span>}
                  <span className='tabular-nums'>
                    {amount(item.number)} × {currency(item.price)}
                  </span>
                </DialogDescription>
                {hasAiCustomize && (
                  <Badge variant='secondary' className='gap-1 font-normal'>
                    <SparklesIcon className='size-3' />
                    {t('systemOrders.detail.snapshot.aiCustomize')}
                  </Badge>
                )}
              </div>

              <p className='shrink-0 text-right text-base font-semibold tabular-nums'>{currency(lineTotal)}</p>
            </div>

            <TabsList className='mt-4 h-auto w-full flex-nowrap justify-start gap-2 overflow-x-auto rounded-none bg-transparent p-0 [&::-webkit-scrollbar]:hidden'>
              {tabs.map((entry) => (
                <TabsTrigger key={entry.value} value={entry.value} className={TAB_TRIGGER_CLASS}>
                  {entry.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DialogHeader>

          <div className='min-h-0 flex-1 overflow-y-auto px-5 py-5'>
            {/* Thông số dòng đơn hàng */}
            <TabsContent value='info' className='mt-0 space-y-6'>
              <InfoCard title={t('systemOrders.detail.item.group.product')}>
                <InfoRow
                  label={t('systemOrders.detail.itemName')}
                  value={
                    item.productId ? (
                      <Link
                        to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${item.productId}`}
                        target='_blank'
                        className='inline-flex items-center gap-1 text-primary hover:underline'
                      >
                        {name}
                        <ExternalLinkIcon className='size-3' />
                      </Link>
                    ) : (
                      name
                    )
                  }
                  alignEnd
                />
                <InfoRow
                  label={t('systemOrders.detail.itemParent')}
                  value={
                    item.parentProductName?.trim() ? (
                      item.parentProductId ? (
                        <Link
                          to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${item.parentProductId}`}
                          target='_blank'
                          className='inline-flex items-center gap-1 text-primary hover:underline'
                        >
                          {item.parentProductName.trim()}
                          <ExternalLinkIcon className='size-3' />
                        </Link>
                      ) : (
                        item.parentProductName.trim()
                      )
                    ) : (
                      empty
                    )
                  }
                  alignEnd
                />
                <InfoRow
                  label={t('systemOrders.detail.item.itemId')}
                  value={item.itemId == null ? empty : `#${item.itemId}`}
                  alignEnd
                />
              </InfoCard>

              <InfoCard title={t('systemOrders.detail.item.group.pricing')}>
                <InfoRow label={t('systemOrders.detail.itemQuantity')} value={amount(item.number)} alignEnd />
                <InfoRow label={t('systemOrders.detail.itemPrice')} value={currency(item.price)} alignEnd />
                <InfoRow label={t('systemOrders.detail.itemTotal')} value={currency(lineTotal)} alignEnd emphasis />
              </InfoCard>

              <InfoCard title={t('systemOrders.detail.item.group.shipping')}>
                <InfoRow label={t('systemOrders.detail.itemWeight')} value={amount(item.weight)} alignEnd />
                <InfoRow label={t('systemOrders.detail.item.dimensions')} value={dimensions} alignEnd />
              </InfoCard>
            </TabsContent>

            {/* Snapshot lúc đặt hàng: phụ kiện, vật liệu - thiệp có tab riêng */}
            <TabsContent value='snapshot' className='mt-0'>
              <ProductSnapshotDetail item={item} showCard={cards.length === 0} t={t} />
            </TabsContent>

            {/* Thiệp đính kèm - tách riêng để xem nhanh không cần cuộn qua vật liệu.
                Banner đối chiếu luôn hiện khi biến thể này có mẫu hoa đi kèm - không phụ
                thuộc số lượng biến thể, vì tên có thể trùng nhau khi số lượng > 1. */}
            {cards.length > 0 && (
              <TabsContent value='card' className='mt-0 divide-y'>
                {cards.map((entry) => (
                  <div key={entry.key} className='space-y-4 py-7 first:pt-0 last:pb-0'>
                    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5'>
                      <p className='text-sm font-semibold'>
                        {metadataList.length > 1
                          ? t('systemOrders.detail.item.variantLabel', {
                              order: entry.order,
                              total: metadataList.length
                            })
                          : t('systemOrders.detail.item.tab.card')}
                        {entry.name && <span className='ml-1.5 font-normal text-muted-foreground'>· {entry.name}</span>}
                      </p>
                      {entry.flowerId ? (
                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          className='h-auto gap-1.5 p-0 font-semibold'
                          onClick={() => setTab('flower')}
                        >
                          <SparklesIcon className='size-4' />
                          {t('systemOrders.detail.item.hint.viewFlower', { order: entry.order })}
                        </Button>
                      ) : (
                        <span className='text-xs text-muted-foreground'>
                          {t('systemOrders.detail.item.hint.noFlower')}
                        </span>
                      )}
                    </div>
                    <CardSnapshot orderDetailsId={item.orderDetailsId} card={entry.card} t={t} />
                  </div>
                ))}
              </TabsContent>
            )}

            {/* Mẫu hoa AI - dữ liệu duy nhất cần gọi API riêng.
                Banner đối chiếu luôn hiện khi biến thể này có thiệp đi kèm - không phụ
                thuộc số lượng biến thể, vì tên có thể trùng nhau khi số lượng > 1. */}
            {flowers.length > 0 && (
              <TabsContent value='flower' className='mt-0 divide-y'>
                {flowers.map((entry) => (
                  <div key={entry.key} className='space-y-4 py-7 first:pt-0 last:pb-0'>
                    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5'>
                      <p className='text-sm font-semibold'>
                        {metadataList.length > 1
                          ? t('systemOrders.detail.item.variantLabel', {
                              order: entry.order,
                              total: metadataList.length
                            })
                          : t('systemOrders.detail.item.tab.flower')}
                        {entry.name && <span className='ml-1.5 font-normal text-muted-foreground'>· {entry.name}</span>}
                      </p>
                      {entry.card ? (
                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          className='h-auto gap-1.5 p-0 font-semibold'
                          onClick={() => setTab('card')}
                        >
                          <MailIcon className='size-4' />
                          {t('systemOrders.detail.item.hint.viewCard', { order: entry.order })}
                        </Button>
                      ) : (
                        <span className='text-xs text-muted-foreground'>
                          {t('systemOrders.detail.item.hint.noCard')}
                        </span>
                      )}
                    </div>
                    <AiFlowerSnapshot generatedFlowerId={entry.flowerId} t={t} />
                  </div>
                ))}
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
