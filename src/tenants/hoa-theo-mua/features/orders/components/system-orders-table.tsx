import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { Row } from '@tanstack/react-table'
import { ExternalLinkIcon, MapPinIcon, MapPinnedIcon, ReceiptTextIcon, TruckIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { useGetSystemOrders } from '../hooks/use-get-system-orders'
import type { SystemOrder } from '../types'
import { vndFormatter } from '../utils'
import { getSystemOrderColumns } from './system-order-columns'
import SystemOrderEditDialog from './update-system-order-dialog'

function hasValidCoordinates(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  )
}

function LocationCard({ order }: { order: SystemOrder }) {
  const { t, i18n } = useTenantTranslation()
  const { latitude, longitude, address, shortAddress } = order

  const hasMap = hasValidCoordinates(latitude, longitude)
  const query = `${latitude},${longitude}`
  const embedSrc = `https://maps.google.com/maps?q=${query}&z=16&hl=${i18n.language}&output=embed`
  const openSrc = `https://www.google.com/maps/search/?api=1&query=${query}`

  const primary = address?.trim() || shortAddress?.trim()
  const secondary =
    address?.trim() && shortAddress?.trim() && shortAddress.trim() !== address.trim() ? shortAddress.trim() : null

  return (
    <Card className='p-0 overflow-hidden gap-0'>
      {hasMap ? (
        <iframe
          title={t('systemOrders.detail.mapTitle')}
          src={embedSrc}
          className='aspect-[16/10] w-full border-0'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
        />
      ) : (
        <div className='flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-muted/40 text-muted-foreground'>
          <MapPinnedIcon className='size-6' />
          <span className='text-sm'>{t('systemOrders.detail.noLocation')}</span>
        </div>
      )}

      <div className='flex items-start gap-2.5 border-t p-3'>
        <MapPinIcon className='mt-0.5 size-4 shrink-0 text-primary' />
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium'>{primary || t('systemOrders.common.noData')}</p>
          {secondary && <p className='truncate text-xs text-muted-foreground'>{secondary}</p>}
        </div>
      </div>

      <div className='px-2 pb-2'>
        {hasMap && (
          <Button asChild size='sm' className='h-7 shrink-0 gap-1.5 w-full'>
            <a href={openSrc} target='_blank' rel='noreferrer'>
              <ExternalLinkIcon className='size-3.5' />
              {t('systemOrders.detail.openInMaps')}
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}

function DetailCard({
  icon: Icon,
  title,
  children
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  children: ReactNode
}) {
  return (
    <div className='flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm'>
      <div className='flex items-center gap-2 border-b bg-muted/40 px-3.5 py-2.5'>
        <Icon className='size-4 text-muted-foreground' />
        <span className='text-sm font-semibold'>{title}</span>
      </div>
      <dl className='divide-y'>{children}</dl>
    </div>
  )
}

/** Label / value pair rendered as a row inside a DetailCard. */
function DetailRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className='flex items-start justify-between gap-4 px-3.5 py-2'>
      <dt className='shrink-0 text-sm text-muted-foreground'>{label}</dt>
      <dd className={cn('min-w-0 text-right text-sm font-medium wrap-break-word', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}

function TrackingLink({ href, label, empty }: { href: string | null; label: string; empty: string }) {
  const url = href?.trim()
  if (!url) return <span className='font-normal text-muted-foreground'>{empty}</span>

  return (
    <a
      href={url}
      target='_blank'
      rel='noreferrer'
      className='inline-flex items-center gap-1 text-primary hover:underline'
    >
      {label}
      <ExternalLinkIcon className='size-3' />
    </a>
  )
}

function SystemOrderDetailsSubRow({ row }: { row: Row<SystemOrder> }) {
  const { t } = useTenantTranslation()
  const order = row.original
  const emptyValue = t('systemOrders.common.noDataShort')
  const text = (value: string | null | undefined) => value?.trim() || emptyValue

  return (
    <div className='grid items-start gap-4 p-4 lg:grid-cols-[minmax(0,26rem)_1fr]'>
      <LocationCard order={order} />

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
        <DetailCard icon={TruckIcon} title={t('systemOrders.detail.shipping')}>
          {/* <DetailRow label={t('systemOrders.detail.trackNumber')} value={text(order.trackNumber)} mono /> */}
          <DetailRow label={t('systemOrders.detail.nhanhOrderId')} value={order.nhanhOrderId ?? emptyValue} mono />
          <DetailRow
            label={t('systemOrders.detail.nhanhTracking')}
            value={
              <TrackingLink
                href={order.nhanhTrackingUrl}
                label={t('systemOrders.detail.openLink')}
                empty={emptyValue}
              />
            }
          />
          <DetailRow
            label={t('systemOrders.detail.ahamoveTracking')}
            value={
              <TrackingLink
                href={order.ahahaMoveTrackingUrl}
                label={t('systemOrders.detail.openLink')}
                empty={emptyValue}
              />
            }
          />
        </DetailCard>

        <DetailCard icon={ReceiptTextIcon} title={t('systemOrders.detail.invoice')}>
          <DetailRow
            label={t('systemOrders.detail.exportInvoice')}
            value={order.isExportInvoice ? t('systemOrders.common.yes') : t('systemOrders.common.no')}
          />
          <DetailRow label={t('systemOrders.detail.taxCode')} value={text(order.taxCode)} mono />
          <DetailRow label={t('systemOrders.detail.receiptName')} value={text(order.receiptFullName)} />
          <DetailRow label={t('systemOrders.detail.receiptPhone')} value={text(order.receiptPhoneNumber)} />
          <DetailRow label={t('systemOrders.detail.receiptEmail')} value={text(order.receiptEmail)} />
          <DetailRow label={t('systemOrders.detail.vat')} value={vndFormatter.format(order.vat)} />
        </DetailCard>
      </div>
    </div>
  )
}

export function SystemOrdersTable() {
  const { t } = useTenantTranslation()
  const [editingOrder, setEditingOrder] = useState<SystemOrder | null>(null)
  const columns = useMemo(() => getSystemOrderColumns({ t, onEdit: setEditingOrder }), [t])

  const { page, limit } = useTableQueryParams({ columns, prefix: 'system-orders' })

  const [searchFilter] = useQueryState('system-orders_customer', parseAsString)

  const search = searchFilter ?? undefined

  const { systemOrders, isGettingSystemOrders } = useGetSystemOrders({ pageIndex: page, pageSize: limit, search })

  const items = systemOrders?.value.items ?? []
  const totalCount = systemOrders?.value.totalCount ?? 0

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount: Math.ceil(totalCount / limit) || 1,
    initialState: {
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        shippingFee: false,
        productFee: false,
        invoice: false,
        remarks: false
      }
    },
    shallow: false,
    clearOnDefault: true,
    filterPrefix: 'system-orders',
    queryKeys: {
      page: 'system-orders_page',
      perPage: 'system-orders_perPage',
      sort: 'system-orders_sort'
    }
  })

  return (
    <>
      <DataTable
        table={table}
        isLoading={isGettingSystemOrders}
        renderSubComponent={({ row }) => <SystemOrderDetailsSubRow row={row} />}
      >
        <DataTableToolbar table={table} />
      </DataTable>

      <SystemOrderEditDialog
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      />
    </>
  )
}
