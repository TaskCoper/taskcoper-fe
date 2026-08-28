import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatCard from '@/features/projects/core/components/stat-card'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  BanknoteIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  Link2Icon,
  PackageIcon,
  PencilIcon,
  ReceiptTextIcon,
  ScanBarcodeIcon,
  TruckIcon,
  WalletIcon
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { OrderItemsTable } from '../features/orders/components/detail/order-items'
import {
  DeliveryCard,
  DetailRows,
  DetailSection,
  OrderDetailSkeleton,
  TrackingLink,
  type DetailRow
} from '../features/orders/components/detail/parts'
import UpdateSystemOrderDialog from '../features/orders/components/update-system-order-dialog'
import { useGetSystemOrder } from '../features/orders/hooks/use-get-system-order'
import { OrderStatus, OrderStatusLabel, OrderStatusStyle } from '../features/orders/types'
import { numberFormatter, vndFormatter } from '../features/orders/utils'

const TAB_VALUES = ['overview', 'items', 'shipping', 'payment', 'invoice'] as const

export default function SystemOrderPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const { systemOrder: order, isGettingSystemOrder } = useGetSystemOrder({ id })

  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  if (isGettingSystemOrder) return <OrderDetailSkeleton />

  if (!order) {
    return (
      <div className='mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center'>
        <span className='flex size-16 items-center justify-center rounded-2xl bg-muted'>
          <PackageIcon className='size-8 text-muted-foreground/50' />
        </span>
        <div className='space-y-1'>
          <h1 className='text-lg font-semibold'>{t('systemOrders.detail.notFound')}</h1>
          <p className='text-sm text-muted-foreground'>{t('systemOrders.detail.notFoundDescription')}</p>
        </div>
        <Button variant='outline' asChild>
          <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders`}>{t('systemOrders.detail.backToList')}</Link>
        </Button>
      </div>
    )
  }

  const empty = t('systemOrders.common.noDataShort')
  const text = (value: string | null | undefined) => value?.trim() || empty
  const currency = (value: number | null | undefined) => (value == null ? empty : vndFormatter.format(value))
  const bool = (value: boolean) => (value ? t('systemOrders.common.yes') : t('systemOrders.common.no'))

  const items = order.details ?? []
  const orderCode = order.orderId?.split('-')[0]?.toUpperCase() ?? ''
  const customerName = order.fullName?.trim() || t('systemOrders.detail.untitled')
  const isPaid = order.status === OrderStatus.Paid
  const statusText = OrderStatusLabel[order.status] ? t(OrderStatusLabel[order.status]) : order.status
  const statusStyle = OrderStatusStyle[order.status] ?? OrderStatusStyle[OrderStatus.Pending]
  const itemCount = items.reduce((sum, item) => sum + (item.number ?? 0), 0)
  const paymentMethod =
    order.paymentMethod == null
      ? empty
      : t(`systemOrders.paymentMethod.${order.paymentMethod}`, { defaultValue: `#${order.paymentMethod}` })

  const overviewRows: DetailRow[] = [
    // { label: 'systemOrders.detail.orderId', value: order.orderId, mono: true },
    { label: 'systemOrders.column.status', value: statusText },
    { label: 'systemOrders.column.createdAt', value: formatDateTime(order.createAt, 'dateTimeShort') },
    { label: 'systemOrders.detail.paymentMethod', value: paymentMethod },
    { label: 'systemOrders.detail.remark', value: text(order.remark) },
    ...(order.orderTime
      ? [{ label: 'systemOrders.detail.orderTime', value: numberFormatter.format(order.orderTime) }]
      : []),
    ...(order.tagsId?.length ? [{ label: 'systemOrders.detail.tags', value: order.tagsId.join(', ') }] : [])
  ]

  const customerRows: DetailRow[] = [
    { label: 'systemOrders.detail.customerName', value: text(order.fullName) },
    { label: 'systemOrders.detail.customerPhone', value: text(order.phone), mono: true },
    { label: 'systemOrders.detail.receiverName', value: text(order.fullNameReceiver) },
    { label: 'systemOrders.detail.receiverPhone', value: text(order.phoneReceiver), mono: true }
    // { label: 'systemOrders.detail.userId', value: text(order.userId), mono: true }
  ]

  const shippingRows: DetailRow[] = [
    { label: 'systemOrders.detail.trackNumber', value: text(order.trackNumber), mono: true },
    { label: 'systemOrders.detail.ahamoveOrderId', value: text(order.ahahaMoveOrderId), mono: true },
    {
      label: 'systemOrders.detail.ahamoveTracking',
      value: <TrackingLink href={order.ahahaMoveTrackingUrl} label={t('systemOrders.detail.openLink')} empty={empty} />
    },
    { label: 'systemOrders.column.shippingFee', value: currency(order.shippingFee) }
  ]

  const paymentRows: DetailRow[] = [
    { label: 'systemOrders.detail.paymentMethod', value: paymentMethod },
    {
      label: 'systemOrders.detail.paymentUrl',
      value: <TrackingLink href={order.paymentUrl} label={t('systemOrders.detail.openLink')} empty={empty} />
    },
    {
      label: 'systemOrders.detail.sepayUrl',
      value: <TrackingLink href={order.sepayUrl} label={t('systemOrders.detail.openLink')} empty={empty} />
    }
  ]

  const transactionRows: DetailRow[] = order.transaction
    ? [
        { label: 'systemOrders.detail.transactionGateway', value: text(order.transaction.gateway) },
        // { label: 'systemOrders.detail.transactionCode', value: text(order.transaction.code), mono: true },
        { label: 'systemOrders.detail.transactionAmount', value: currency(order.transaction.transferAmount) },
        {
          label: 'systemOrders.detail.transactionDate',
          value: order.transaction.transactionDate
            ? formatDateTime(order.transaction.transactionDate, 'dateTimeShort')
            : empty
        }
      ]
    : []

  const feeRows: DetailRow[] = [
    { label: 'systemOrders.column.productFee', value: currency(order.productFee) },
    { label: 'systemOrders.column.shippingFee', value: currency(order.shippingFee) },
    { label: 'systemOrders.detail.vat', value: currency(order.vatFee) },
    { label: 'systemOrders.column.amount', value: currency(order.totalFee) }
  ]

  const invoiceRows: DetailRow[] = [
    { label: 'systemOrders.detail.exportInvoice', value: bool(order.isExportInvoice) },
    ...(order.invoiceType != null
      ? [{ label: 'systemOrders.detail.invoiceType', value: String(order.invoiceType) }]
      : []),
    { label: 'systemOrders.detail.taxCode', value: text(order.taxCode) },
    { label: 'systemOrders.detail.identityNumber', value: text(order.identityNumber) },
    { label: 'systemOrders.detail.receiptName', value: text(order.receiptFullName) },
    { label: 'systemOrders.detail.receiptPhone', value: text(order.receiptPhoneNumber) },
    { label: 'systemOrders.detail.receiptEmail', value: text(order.receiptEmail) },
    { label: 'systemOrders.detail.receiptAddress', value: text(order.receiptAddress) },
    { label: 'systemOrders.detail.vat', value: currency(order.vatFee) }
  ]

  const rawTab = searchParams.get('tab')
  const currentTab = TAB_VALUES.includes(rawTab as (typeof TAB_VALUES)[number]) ? rawTab! : 'overview'

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', value)
    setSearchParams(next, { replace: true })
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.orderId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable - silently ignore */
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      /* clipboard unavailable - silently ignore */
    }
  }

  const TABS = [
    { value: 'overview', label: t('systemOrders.detail.tab.overview') },
    { value: 'items', label: t('systemOrders.detail.tab.items') },
    { value: 'shipping', label: t('systemOrders.detail.tab.shipping') },
    { value: 'payment', label: t('systemOrders.detail.tab.payment') },
    { value: 'invoice', label: t('systemOrders.detail.tab.invoice') }
  ]

  return (
    <div className='absolute inset-0 overflow-y-auto bg-muted/30'>
      <Tabs value={currentTab} onValueChange={handleTabChange} className='flex flex-col'>
        {/* Dashboard header */}
        <div className='space-y-5 px-4 pt-6 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <nav className='flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground'>
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/system-orders`}
              className='shrink-0 transition-colors hover:text-foreground'
            >
              {t('systemOrders.list.title')}
            </Link>
            <ChevronRightIcon className='size-3.5 shrink-0' />
            <span className='truncate font-medium text-foreground'>{customerName}</span>
          </nav>

          {/* Title + actions */}
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='min-w-0 space-y-2'>
              <div className='flex flex-wrap items-center gap-2.5'>
                <h1 className='text-2xl font-bold leading-tight tracking-tight'>{customerName}</h1>
                <Badge variant='secondary' className={cn('gap-1.5 font-medium', statusStyle.badge)}>
                  <span className={cn('size-1.5 rounded-full', statusStyle.dot)} />
                  {statusText}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                {formatDateTime(order.createAt, 'dateTimeShort')}
                {order.phone?.trim() && (
                  <>
                    <span className='mx-2 text-muted-foreground/40'>•</span>
                    {order.phone.trim()}
                  </>
                )}
              </p>
              <div className='flex flex-wrap items-center gap-2'>
                {order.isExportInvoice && (
                  <Badge variant='secondary' className='font-normal'>
                    {t('systemOrders.invoice.export')}
                  </Badge>
                )}
                <button
                  type='button'
                  onClick={handleCopyCode}
                  className='inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground'
                  title={t('systemOrders.detail.copyOrderId')}
                >
                  {copied ? <CheckIcon className='size-3 text-emerald-500' /> : <ScanBarcodeIcon className='size-3' />}
                  {orderCode}
                </button>
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              {order.paymentUrl?.trim() && (
                <Button variant='outline' size='sm' asChild>
                  <a href={order.paymentUrl} target='_blank' rel='noreferrer'>
                    <ExternalLinkIcon className='size-3.5' />
                    {t('systemOrders.action.openPayment')}
                  </a>
                </Button>
              )}
              <Button variant='outline' size='sm' onClick={handleCopyLink}>
                {linkCopied ? <CheckIcon className='size-3.5 text-emerald-500' /> : <Link2Icon className='size-3.5' />}
                {linkCopied ? t('systemOrders.detail.copied') : t('systemOrders.detail.share')}
              </Button>
              <Button size='sm' onClick={() => setIsEditing(true)}>
                <PencilIcon className='size-3.5' />
                {t('systemOrders.action.edit')}
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title={t('systemOrders.column.amount')}
              value={currency(order.totalFee)}
              icon={<WalletIcon className='size-4 text-white' />}
              color='blue'
            />
            <StatCard
              title={t('systemOrders.column.productFee')}
              value={currency(order.productFee)}
              icon={<BanknoteIcon className='size-4 text-white' />}
              color='green'
            />
            <StatCard
              title={t('systemOrders.column.shippingFee')}
              value={currency(order.shippingFee)}
              icon={<TruckIcon className='size-4 text-white' />}
              color='purple'
            />
            <StatCard
              title={t('systemOrders.detail.itemCount')}
              value={numberFormatter.format(itemCount)}
              icon={<CircleDotIcon className='size-4 text-white' />}
              color={isPaid ? 'emerald' : 'slate'}
            />
          </div>

          {/* Tabs */}
          <TabsList className='w-full flex-nowrap justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 [&::-webkit-scrollbar]:hidden'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='relative flex-none shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content */}
        <div className='w-full px-4 pb-6 pt-2 sm:px-6 lg:px-8'>
          {/* Overview */}
          <TabsContent value='overview' className='mt-0'>
            <div className='grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]'>
              <div className='space-y-8'>
                <DetailSection
                  title={t('systemOrders.detail.section.order')}
                  description={t('systemOrders.detail.sectionDesc.order')}
                >
                  <DetailRows rows={overviewRows} t={t} />
                </DetailSection>

                <DetailSection
                  title={t('systemOrders.detail.section.customer')}
                  description={t('systemOrders.detail.sectionDesc.customer')}
                >
                  <DetailRows rows={customerRows} t={t} />
                </DetailSection>

                <DetailSection
                  title={t('systemOrders.detail.section.fees')}
                  description={t('systemOrders.detail.sectionDesc.fees')}
                >
                  <DetailRows rows={feeRows} t={t} />
                </DetailSection>
              </div>

              <DetailSection
                title={t('systemOrders.detail.section.delivery')}
                description={t('systemOrders.detail.sectionDesc.delivery')}
                className='xl:sticky xl:top-4'
              >
                <DeliveryCard
                  latitude={order.latitude}
                  longitude={order.longitude}
                  address={order.address}
                  shortAddress={order.shortAddress}
                  ward={order.ward}
                  city={order.city}
                  receiverName={order.fullNameReceiver ?? order.fullName}
                  receiverPhone={order.phoneReceiver ?? order.phone}
                />
              </DetailSection>
            </div>
          </TabsContent>

          {/* Line items */}
          <TabsContent value='items' className='mt-0'>
            <DetailSection
              title={t('systemOrders.detail.section.items')}
              description={t('systemOrders.detail.sectionDesc.items')}
              action={
                <Badge variant='secondary' className='font-normal'>
                  {items.length}
                </Badge>
              }
            >
              <OrderItemsTable items={items} t={t} />
            </DetailSection>
          </TabsContent>

          {/* Shipping */}
          <TabsContent value='shipping' className='mt-0'>
            <div className='grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]'>
              <DetailSection
                title={t('systemOrders.detail.section.shipping')}
                description={t('systemOrders.detail.sectionDesc.shipping')}
              >
                <DetailRows rows={shippingRows} t={t} />
              </DetailSection>

              <DetailSection
                title={t('systemOrders.detail.section.delivery')}
                description={t('systemOrders.detail.sectionDesc.delivery')}
                className='xl:sticky xl:top-4'
              >
                <DeliveryCard
                  latitude={order.latitude}
                  longitude={order.longitude}
                  address={order.address}
                  shortAddress={order.shortAddress}
                  ward={order.ward}
                  city={order.city}
                  receiverName={order.fullNameReceiver ?? order.fullName}
                  receiverPhone={order.phoneReceiver ?? order.phone}
                />
              </DetailSection>
            </div>
          </TabsContent>

          {/* Payment */}
          <TabsContent value='payment' className='mt-0 space-y-8'>
            <DetailSection
              title={t('systemOrders.detail.section.payment')}
              description={t('systemOrders.detail.sectionDesc.payment')}
            >
              <DetailRows rows={paymentRows} t={t} />
            </DetailSection>

            <DetailSection
              title={t('systemOrders.detail.section.transaction')}
              description={t('systemOrders.detail.sectionDesc.transaction')}
            >
              {transactionRows.length > 0 ? (
                <DetailRows rows={transactionRows} t={t} />
              ) : (
                <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
                  {t('systemOrders.detail.noTransaction')}
                </div>
              )}
            </DetailSection>

            <DetailSection
              title={t('systemOrders.detail.section.fees')}
              description={t('systemOrders.detail.sectionDesc.fees')}
            >
              <DetailRows rows={feeRows} t={t} />
            </DetailSection>
          </TabsContent>

          {/* Invoice */}
          <TabsContent value='invoice' className='mt-0'>
            <DetailSection
              title={t('systemOrders.detail.section.invoice')}
              description={t('systemOrders.detail.sectionDesc.invoice')}
              action={
                order.isExportInvoice ? (
                  <Badge variant='secondary' className='gap-1.5 font-normal'>
                    <ReceiptTextIcon className='size-3.5' />
                    {t('systemOrders.invoice.export')}
                  </Badge>
                ) : undefined
              }
            >
              <DetailRows rows={invoiceRows} t={t} />
            </DetailSection>
          </TabsContent>
        </div>
      </Tabs>

      <UpdateSystemOrderDialog order={order} open={isEditing} onOpenChange={setIsEditing} />
    </div>
  )
}
