import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { ChevronRightIcon, GiftIcon, MailIcon, PackageIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import type { SystemOrderItem } from '../../types'
import { numberFormatter, vndFormatter } from '../../utils'
import OrderItemDialog from './order-item-dialog'

const formatCurrency = (value: number | null | undefined, empty: string) =>
  value == null ? empty : vndFormatter.format(value)

const formatNumber = (value: number | null | undefined, empty: string) =>
  value == null ? empty : numberFormatter.format(value)

/** Đếm nhanh những gì snapshot của dòng đơn hàng có, để hiện dấu hiệu ngay trên bảng. */
const summarizeSnapshot = (item: SystemOrderItem) => {
  const metadataList = item.snapshot?.productMetadata ?? []

  return {
    accessories: metadataList.reduce(
      (sum, metadata) => sum + (metadata.ribbon ? 1 : 0) + (metadata.wrappingPaper ? 1 : 0),
      0
    ),
    materials: metadataList.reduce(
      (sum, metadata) => sum + (metadata.materials?.length ?? 0) + (metadata.additionCustome?.length ?? 0),
      0
    ),
    hasCard: metadataList.some((metadata) => metadata.snapShotCard),
    hasFlower: metadataList.some((metadata) => metadata.generatedFlower?.trim())
  }
}

export function OrderItemsTable({ items, t }: { items: SystemOrderItem[]; t: TenantT }) {
  const [selectedItem, setSelectedItem] = useState<SystemOrderItem | null>(null)
  const empty = t('systemOrders.common.noDataShort')

  if (items.length === 0) {
    return (
      <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
        {t('systemOrders.detail.noItems')}
      </div>
    )
  }

  return (
    <>
      <div className='overflow-x-auto rounded-lg border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16' />
              <TableHead>{t('systemOrders.detail.itemName')}</TableHead>
              <TableHead>{t('systemOrders.detail.itemParent')}</TableHead>
              <TableHead className='text-right'>{t('systemOrders.detail.itemWeight')}</TableHead>
              <TableHead className='text-right'>{t('systemOrders.detail.itemQuantity')}</TableHead>
              <TableHead className='text-right'>{t('systemOrders.detail.itemPrice')}</TableHead>
              <TableHead className='text-right'>{t('systemOrders.detail.itemTotal')}</TableHead>
              <TableHead className='w-10' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const name = item.name?.trim() || empty
              const lineTotal = item.price != null && item.number != null ? item.price * item.number : null
              const summary = summarizeSnapshot(item)

              return (
                <TableRow
                  key={item.orderDetailsId}
                  onClick={() => setSelectedItem(item)}
                  tabIndex={0}
                  role='button'
                  aria-label={t('systemOrders.detail.item.open')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedItem(item)
                    }
                  }}
                  className='cursor-pointer align-top focus-visible:bg-muted/60 focus-visible:outline-none'
                >
                  <TableCell className='w-16'>
                    <span className='flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={name} className='size-full object-cover' />
                      ) : (
                        <PackageIcon className='size-5 text-muted-foreground/50' />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className='max-w-72'>
                    <span className='font-medium'>{name}</span>
                    {/* Dấu hiệu nội dung snapshot - chi tiết nằm trong dialog. */}
                    <div className='mt-0.5 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground'>
                      {item.itemId != null && <span className='font-mono'>#{item.itemId}</span>}
                      {summary.accessories > 0 && (
                        <span className='inline-flex items-center gap-1'>
                          <GiftIcon className='size-3' />
                          {summary.accessories}
                        </span>
                      )}
                      {summary.materials > 0 && (
                        <span className='inline-flex items-center gap-1'>
                          <PackageIcon className='size-3' />
                          {summary.materials}
                        </span>
                      )}
                      {summary.hasCard && (
                        <span className='inline-flex items-center gap-1'>
                          <MailIcon className='size-3' />
                          {t('systemOrders.detail.snapshot.card')}
                        </span>
                      )}
                      {summary.hasFlower && (
                        <span className='inline-flex items-center gap-1 text-primary'>
                          <SparklesIcon className='size-3' />
                          {t('systemOrders.detail.item.tab.flower')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-56'>
                    {item.parentProductName?.trim() ? (
                      <Badge variant='secondary' className='font-normal'>
                        {item.parentProductName.trim()}
                      </Badge>
                    ) : (
                      <span className='text-muted-foreground'>{empty}</span>
                    )}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right tabular-nums text-muted-foreground'>
                    {formatNumber(item.weight, empty)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right tabular-nums'>
                    {formatNumber(item.number, empty)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right tabular-nums'>
                    {formatCurrency(item.price, empty)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right font-semibold tabular-nums'>
                    {formatCurrency(lineTotal, empty)}
                  </TableCell>
                  <TableCell className='w-10 text-muted-foreground'>
                    <ChevronRightIcon className='size-4' />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedItem && (
        <OrderItemDialog
          key={selectedItem.orderDetailsId}
          item={selectedItem}
          open
          onOpenChange={(open) => !open && setSelectedItem(null)}
          t={t}
        />
      )}
    </>
  )
}
