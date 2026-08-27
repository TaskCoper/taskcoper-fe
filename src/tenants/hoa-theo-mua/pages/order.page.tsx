import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatCard from '@/features/projects/core/components/stat-card'
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  BanknoteIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDotIcon,
  CopyIcon,
  Link2Icon,
  PackageIcon,
  ScanBarcodeIcon,
  StickyNoteIcon,
  TruckIcon,
  WalletIcon
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import {
  DetailRows,
  DetailSection,
  OrderDetailSkeleton,
  type DetailRow
} from '../features/orders/components/detail/parts'
import { useGetOrder } from '../features/orders/hooks/use-get-order'
import type { Order, OrderDetailRow } from '../features/orders/types'
import { numberFormatter, vndFormatter } from '../features/orders/utils'

type FieldFormat = 'text' | 'currency' | 'number' | 'date'

interface FieldConfig<T> {
  key: keyof T
  format?: FieldFormat
}

/** A field group rendered as one `DetailSection`; the title resolves from `orders.detail.section.<id>`. */
interface Section {
  id: string
  fields: FieldConfig<Order>[]
}

const ORDER_INFO_SECTION: Section = {
  id: 'orderInfo',
  fields: [
    { key: 'idDonHangNhanh' },
    { key: 'idDonHangApi' },
    { key: 'loaiDon' },
    { key: 'thoiGianDonHang', format: 'date' },
    { key: 'nguoiTaoDon' },
    { key: 'cuaHang' },
    { key: 'nguon' },
    { key: 'nguonDonHang' },
    { key: 'khoTaoDon' },
    { key: 'soThuTuTheoNgay', format: 'number' },
    { key: 'maGiamGia' },
    { key: 'maAffiliate' },
    { key: 'nhan' },
    { key: 'maThamChieu' }
  ]
}

const CUSTOMER_SECTION: Section = {
  id: 'customer',
  fields: [
    { key: 'tenKhachHang' },
    { key: 'maKhachHang' },
    { key: 'soDienThoaiKhachHang' },
    { key: 'emailKhachHang' },
    { key: 'capDoKhachHang' },
    { key: 'nhomKhachHang' },
    { key: 'ngaySinhKhachHang', format: 'date' },
    { key: 'diaChiKhachHang' },
    { key: 'phuongXaKhachHang' },
    { key: 'quanHuyenKhachHang' },
    { key: 'thanhPhoKhachHang' }
  ]
}

const SHIPPING_SECTION: Section = {
  id: 'shipping',
  fields: [
    { key: 'congVanChuyen' },
    { key: 'hangVanChuyen' },
    { key: 'dichVuVanChuyen' },
    { key: 'maVanDon' },
    { key: 'soNgayChuyenHang', format: 'number' },
    { key: 'tongKhoiLuong', format: 'number' },
    { key: 'canNangHangVanChuyen', format: 'number' },
    { key: 'ghiChuHangVanChuyen' },
    { key: 'khoLayHang' },
    { key: 'thanhPhoLayHang' },
    { key: 'quanHuyenLayHang' },
    { key: 'thanhPhoKhoHang' },
    { key: 'quanHuyenKhoHang' }
  ]
}

const FINANCIAL_SECTION: Section = {
  id: 'financial',
  fields: [
    { key: 'giaTriDonHang', format: 'currency' },
    { key: 'phiVanChuyen', format: 'currency' },
    { key: 'phiVuotCan', format: 'currency' },
    { key: 'phiKhaiGia', format: 'currency' },
    { key: 'phiChuyenHoan', format: 'currency' },
    { key: 'phiThuTienHo', format: 'currency' },
    { key: 'phiShipBaoKhach', format: 'currency' },
    { key: 'tienChietKhau', format: 'currency' },
    { key: 'tienVat', format: 'currency' },
    { key: 'tyLeVat' },
    { key: 'tienTieuDiem', format: 'currency' },
    { key: 'tienDatCoc', format: 'currency' },
    { key: 'tienChuyenKhoan', format: 'currency' },
    { key: 'tienQuetThe', format: 'currency' },
    { key: 'tongThu', format: 'currency' },
    { key: 'loiNhuan', format: 'currency' },
    { key: 'tyLeLoiNhuan' }
  ]
}

const PAYMENT_SECTION: Section = {
  id: 'payment',
  fields: [
    { key: 'taiKhoanChuyenKhoan' },
    { key: 'taiKhoanDatCoc' },
    { key: 'taiKhoanQuetThe' },
    { key: 'maGiaoDichQuetThe' },
    { key: 'ngayHenThanhToan', format: 'date' }
  ]
}

const STATUS_SECTION: Section = {
  id: 'status',
  fields: [
    { key: 'trangThaiDonHang' },
    { key: 'lyDoHuy' },
    { key: 'nhanVienBanHang' },
    { key: 'nhanVienChamSocKhachHang' },
    { key: 'ngayXacNhan', format: 'date' },
    { key: 'ngayGuiHangVanChuyen', format: 'date' },
    { key: 'ngayBanGiao', format: 'date' },
    { key: 'ngayThanhCong', format: 'date' },
    { key: 'gioThanhCong' },
    { key: 'trangThaiDoiSoat' },
    { key: 'ngayDoiSoat', format: 'date' },
    { key: 'trangThaiThanhToanDoanhNghiep' },
    { key: 'ngayThanhToanDoanhNghiep', format: 'date' }
  ]
}

const INVOICE_SECTION: Section = {
  id: 'invoice',
  fields: [
    { key: 'trangThaiHoaDonDienTu' },
    { key: 'soHoaDonDienTu' },
    { key: 'ngayXuatHoaDonDienTu', format: 'date' },
    { key: 'maCoQuanThueHoaDonDienTu' },
    { key: 'coLayHoaDon' },
    { key: 'loaiKhachHangHoaDon' },
    { key: 'soHoaDon' },
    { key: 'ngayPhatHanhHoaDon', format: 'date' },
    { key: 'maCoQuanThueHoaDon' },
    { key: 'tenKhachHangTrenHoaDonDienTu' },
    { key: 'diaChiKhachHangTrenHoaDonDienTu' },
    { key: 'maSoThue' },
    { key: 'idPhapNhan' }
  ]
}

const CONTACT_SECTION: Section = {
  id: 'contact',
  fields: [
    { key: 'tenNguoiLienHe' },
    { key: 'soDienThoaiNguoiLienHe' },
    { key: 'emailNguoiLienHe' },
    { key: 'emailNguoiLienHeThuHai' },
    { key: 'facebookPsid' },
    { key: 'facebookPageUserId' },
    { key: 'soDienThoaiFacebook' },
    { key: 'giaTriFacebook' }
  ]
}

const RELATED_SECTION: Section = {
  id: 'related',
  fields: [{ key: 'idDonTra' }, { key: 'idDonGoc' }]
}

const META_SECTION: Section = {
  id: 'meta',
  fields: [
    { key: 'createdAt', format: 'date' },
    { key: 'updatedAt', format: 'date' }
  ]
}

const TAB_VALUES = ['overview', 'items', 'shipping', 'financial', 'status', 'invoice'] as const

/** Long-form free-text fields rendered as blocks rather than key/value rows. */
const NOTE_FIELDS = ['ghiChuCuaKhach', 'ghiChuNoiBo', 'bienBan', 'bienBanBanGiao'] as const

/** Line-item columns shown in the products table, in display order. */
const LINE_ITEM_FIELDS: FieldConfig<OrderDetailRow>[] = [
  { key: 'maSanPham' },
  { key: 'maVach' },
  { key: 'danhMucSanPham' },
  { key: 'donViTinh' },
  { key: 'khoiLuongSanPham', format: 'number' },
  { key: 'soLuong', format: 'number' },
  { key: 'giaBan', format: 'currency' },
  { key: 'giaBanTruocVat', format: 'currency' },
  { key: 'tienVatSanPham', format: 'currency' },
  { key: 'chietKhauSanPham', format: 'currency' },
  { key: 'giaSanPhamSauChietKhau', format: 'currency' },
  { key: 'giaVon', format: 'currency' }
]

function formatValue(value: unknown, format: FieldFormat | undefined): string | null {
  if (value == null) return null

  if (format === 'currency') return typeof value === 'number' ? vndFormatter.format(value) : null
  if (format === 'number') return typeof value === 'number' ? numberFormatter.format(value) : null
  if (format === 'date') return typeof value === 'string' ? formatDateTime(value, 'dateTimeShort') : null

  const text = String(value).trim()
  return text ? text : null
}

// The order status is a free-text Vietnamese label from Nhanh.vn; treat "successful/paid" states as positive.
function isPositiveStatus(status: string | null) {
  if (!status) return false
  const normalized = status.toLowerCase()
  return (
    normalized.includes('thành công') ||
    normalized.includes('hoàn thành') ||
    normalized.includes('đã thanh toán') ||
    normalized.includes('success') ||
    normalized.includes('complete') ||
    normalized.includes('paid')
  )
}

function buildRows(fields: FieldConfig<Order>[], order: Order): DetailRow[] {
  return fields
    .map((field) => ({
      label: `orders.field.${String(field.key)}`,
      value: formatValue(order[field.key], field.format)
    }))
    .filter((row) => row.value !== null)
}

/** Renders a field group, skipping it entirely when the order carries no value for any of its fields. */
function OrderSection({ section, order, t }: { section: Section; order: Order; t: TenantT }) {
  const rows = buildRows(section.fields, order)
  if (rows.length === 0) return null

  return (
    <DetailSection title={t(`orders.detail.section.${section.id}`)}>
      <DetailRows rows={rows} t={t} />
    </DetailSection>
  )
}

export default function OrderPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const { order, isGettingOrder } = useGetOrder({ id })

  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  if (isGettingOrder) return <OrderDetailSkeleton />

  if (!order) {
    return (
      <div className='mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center'>
        <span className='flex size-16 items-center justify-center rounded-2xl bg-muted'>
          <PackageIcon className='size-8 text-muted-foreground/50' />
        </span>
        <div className='space-y-1'>
          <h1 className='text-lg font-semibold'>{t('orders.detail.notFound')}</h1>
          <p className='text-sm text-muted-foreground'>{t('orders.detail.notFoundDescription')}</p>
        </div>
        <Button variant='outline' asChild>
          <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`}>{t('orders.detail.backToList')}</Link>
        </Button>
      </div>
    )
  }

  const emptyValue = t('orders.common.noDataShort')
  const currency = (value: number | null) => (value == null ? emptyValue : vndFormatter.format(value))

  const orderCode = order.idDonHangNhanh?.trim() || t('orders.detail.untitled')
  const status = order.trangThaiDonHang?.trim() ?? null
  const positive = isPositiveStatus(status)
  const details = order.orderNhanhVnDetails ?? []
  const customerName = order.tenKhachHang?.trim()

  const noteRows = NOTE_FIELDS.map((key) => ({ key, value: order[key]?.trim() ?? '' })).filter(
    (row) => row.value !== ''
  )

  const rawTab = searchParams.get('tab')
  const currentTab = TAB_VALUES.includes(rawTab as (typeof TAB_VALUES)[number]) ? rawTab! : 'overview'

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', value)
    setSearchParams(next, { replace: true })
  }

  const handleCopyCode = async () => {
    const code = order.idDonHangNhanh?.trim()
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success(t('orders.copyOrderId.success'))
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
    { value: 'overview', label: t('orders.detail.tab.overview') },
    { value: 'items', label: t('orders.detail.tab.items') },
    { value: 'shipping', label: t('orders.detail.tab.shipping') },
    { value: 'financial', label: t('orders.detail.tab.financial') },
    { value: 'status', label: t('orders.detail.tab.status') },
    { value: 'invoice', label: t('orders.detail.tab.invoice') }
  ]

  return (
    <div className='absolute inset-0 overflow-y-auto bg-muted/30'>
      <Tabs value={currentTab} onValueChange={handleTabChange} className='flex flex-col'>
        {/* Dashboard header */}
        <div className='space-y-5 px-4 pt-6 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <nav className='flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground'>
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`}
              className='shrink-0 transition-colors hover:text-foreground'
            >
              {t('orders.list.title')}
            </Link>
            <ChevronRightIcon className='size-3.5 shrink-0' />
            <span className='truncate font-medium text-foreground'>{orderCode}</span>
          </nav>

          {/* Title + actions */}
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='min-w-0 space-y-2'>
              <div className='flex flex-wrap items-center gap-2.5'>
                <h1 className='font-mono text-2xl font-bold leading-tight tracking-tight'>{orderCode}</h1>
                {status && (
                  <Badge
                    variant='secondary'
                    className={cn(
                      'gap-1.5 font-medium',
                      positive
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : ''
                    )}
                  >
                    <span
                      className={cn('size-1.5 rounded-full', positive ? 'bg-emerald-500' : 'bg-muted-foreground/50')}
                    />
                    {status}
                  </Badge>
                )}
              </div>
              <p className='text-sm text-muted-foreground'>
                {order.thoiGianDonHang
                  ? formatDateTime(order.thoiGianDonHang, 'dateTimeShort')
                  : t('orders.common.noData')}
                {customerName && (
                  <>
                    <span className='mx-2 text-muted-foreground/40'>•</span>
                    {customerName}
                  </>
                )}
              </p>
              <div className='flex flex-wrap items-center gap-2'>
                {order.loaiDon?.trim() && (
                  <Badge variant='secondary' className='font-normal'>
                    {order.loaiDon.trim()}
                  </Badge>
                )}
                {order.nguon?.trim() && (
                  <Badge variant='secondary' className='font-normal'>
                    {order.nguon.trim()}
                  </Badge>
                )}
                {order.maVanDon?.trim() && (
                  <span className='inline-flex items-center gap-1 font-mono text-xs text-muted-foreground'>
                    <ScanBarcodeIcon className='size-3' />
                    {order.maVanDon.trim()}
                  </span>
                )}
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleCopyLink}>
                {linkCopied ? <CheckIcon className='size-3.5 text-emerald-500' /> : <Link2Icon className='size-3.5' />}
                {linkCopied ? t('orders.detail.copied') : t('orders.detail.share')}
              </Button>
              <Button size='sm' onClick={handleCopyCode} disabled={!order.idDonHangNhanh?.trim()}>
                {copied ? <CheckIcon className='size-3.5' /> : <CopyIcon className='size-3.5' />}
                {t('orders.action.copyOrderId')}
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title={t('orders.field.giaTriDonHang')}
              value={currency(order.giaTriDonHang)}
              icon={<WalletIcon className='size-4 text-white' />}
              color='blue'
            />
            <StatCard
              title={t('orders.field.loiNhuan')}
              value={currency(order.loiNhuan)}
              icon={<BanknoteIcon className='size-4 text-white' />}
              color={order.loiNhuan != null && order.loiNhuan < 0 ? 'red' : 'green'}
            />
            <StatCard
              title={t('orders.field.phiVanChuyen')}
              value={currency(order.phiVanChuyen)}
              icon={<TruckIcon className='size-4 text-white' />}
              color='purple'
            />
            <StatCard
              title={t('orders.detail.itemCount')}
              value={numberFormatter.format(details.length)}
              icon={<CircleDotIcon className='size-4 text-white' />}
              color={positive ? 'emerald' : 'slate'}
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
                <OrderSection section={ORDER_INFO_SECTION} order={order} t={t} />
                <OrderSection section={CUSTOMER_SECTION} order={order} t={t} />
              </div>

              <div className='space-y-8 xl:sticky xl:top-4'>
                <OrderSection section={RELATED_SECTION} order={order} t={t} />
                <OrderSection section={META_SECTION} order={order} t={t} />

                {noteRows.length > 0 && (
                  <DetailSection title={t('orders.detail.section.notes')}>
                    <div className='space-y-4 rounded-lg border bg-card p-4'>
                      {noteRows.map((row) => (
                        <div key={row.key} className='space-y-1'>
                          <p className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                            <StickyNoteIcon className='size-3.5' />
                            {t(`orders.field.${row.key}`)}
                          </p>
                          <p className='whitespace-pre-wrap text-sm'>{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </DetailSection>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Line items */}
          <TabsContent value='items' className='mt-0'>
            <DetailSection
              title={t('orders.detail.section.lineItems')}
              action={
                <Badge variant='secondary' className='font-normal'>
                  {numberFormatter.format(details.length)}
                </Badge>
              }
            >
              {details.length === 0 ? (
                <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
                  {t('orders.detail.noItems')}
                </div>
              ) : (
                <div className='overflow-x-auto rounded-lg border bg-card'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('orders.productTable.name')}</TableHead>
                        {LINE_ITEM_FIELDS.map((field) => (
                          <TableHead
                            key={field.key}
                            className={cn(
                              'whitespace-nowrap',
                              field.format === 'currency' || field.format === 'number' ? 'text-right' : ''
                            )}
                          >
                            {t(`orders.lineItem.${field.key}`)}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail) => {
                        const gift = detail.quaTangKem?.trim()
                        const note = detail.ghiChuSanPham?.trim()

                        return (
                          <TableRow key={detail.id} className='align-top text-sm'>
                            <TableCell className='min-w-48 font-medium'>
                              <span className='block'>{detail.tenSanPham?.trim() || emptyValue}</span>
                              {gift && (
                                <span className='mt-0.5 block text-xs font-normal text-emerald-600 dark:text-emerald-400'>
                                  🎁 {gift}
                                </span>
                              )}
                              {note && (
                                <span className='mt-0.5 block text-xs font-normal text-muted-foreground'>{note}</span>
                              )}
                            </TableCell>
                            {LINE_ITEM_FIELDS.map((field) => {
                              const rendered = formatValue(detail[field.key], field.format)
                              const numeric = field.format === 'currency' || field.format === 'number'

                              return (
                                <TableCell
                                  key={field.key}
                                  className={cn(
                                    'whitespace-nowrap',
                                    numeric ? 'text-right tabular-nums' : 'text-muted-foreground',
                                    field.key === 'maSanPham' || field.key === 'maVach' ? 'font-mono' : ''
                                  )}
                                >
                                  {rendered ?? emptyValue}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DetailSection>
          </TabsContent>

          {/* Shipping */}
          <TabsContent value='shipping' className='mt-0'>
            <OrderSection section={SHIPPING_SECTION} order={order} t={t} />
          </TabsContent>

          {/* Financials */}
          <TabsContent value='financial' className='mt-0 space-y-8'>
            <OrderSection section={FINANCIAL_SECTION} order={order} t={t} />
            <OrderSection section={PAYMENT_SECTION} order={order} t={t} />
          </TabsContent>

          {/* Status & timeline */}
          <TabsContent value='status' className='mt-0'>
            <OrderSection section={STATUS_SECTION} order={order} t={t} />
          </TabsContent>

          {/* Invoice */}
          <TabsContent value='invoice' className='mt-0 space-y-8'>
            <OrderSection section={INVOICE_SECTION} order={order} t={t} />
            <OrderSection section={CONTACT_SECTION} order={order} t={t} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
