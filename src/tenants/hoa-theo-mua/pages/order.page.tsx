import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  BanknoteIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  ContactIcon,
  CopyIcon,
  FileTextIcon,
  Link2Icon,
  PackageIcon,
  ReceiptTextIcon,
  StickyNoteIcon,
  TrendingUpIcon,
  TruckIcon,
  UserIcon,
  WalletIcon
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { useGetOrder } from '../features/orders/hooks/use-get-order'
import type { Order, OrderDetailRow } from '../features/orders/types'
import { numberFormatter, vndFormatter } from '../features/orders/utils'

type FieldFormat = 'text' | 'currency' | 'number' | 'date'

interface FieldConfig<T> {
  key: keyof T
  format?: FieldFormat
}

interface Section {
  id: string
  icon: typeof PackageIcon
  fields: FieldConfig<Order>[]
}

/** Grouped field layout for the detail view. Labels resolve from `orders.field.<key>`. */
const SECTIONS: Section[] = [
  {
    id: 'orderInfo',
    icon: ClipboardListIcon,
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
  },
  {
    id: 'customer',
    icon: UserIcon,
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
  },
  {
    id: 'shipping',
    icon: TruckIcon,
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
  },
  {
    id: 'financial',
    icon: WalletIcon,
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
  },
  {
    id: 'payment',
    icon: BanknoteIcon,
    fields: [
      { key: 'taiKhoanChuyenKhoan' },
      { key: 'taiKhoanDatCoc' },
      { key: 'taiKhoanQuetThe' },
      { key: 'maGiaoDichQuetThe' },
      { key: 'ngayHenThanhToan', format: 'date' }
    ]
  },
  {
    id: 'status',
    icon: TrendingUpIcon,
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
  },
  {
    id: 'invoice',
    icon: ReceiptTextIcon,
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
  },
  {
    id: 'contact',
    icon: ContactIcon,
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
  },
  {
    id: 'related',
    icon: FileTextIcon,
    fields: [{ key: 'idDonTra' }, { key: 'idDonGoc' }]
  },
  {
    id: 'meta',
    icon: FileTextIcon,
    fields: [
      { key: 'createdAt', format: 'date' },
      { key: 'updatedAt', format: 'date' }
    ]
  }
]

/** Long-form free-text fields rendered as blocks rather than in the two-column grid. */
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

interface SpecRow {
  key: string
  label: string
  value: string
}

function buildRows(fields: FieldConfig<Order>[], order: Order, t: TenantT): SpecRow[] {
  return fields
    .map((field) => ({
      key: String(field.key),
      label: t(`orders.field.${field.key}`),
      value: formatValue(order[field.key], field.format)
    }))
    .filter((row): row is SpecRow => row.value !== null)
}

function SectionCard({ title, icon: Icon, rows }: { title: string; icon: typeof PackageIcon; rows: SpecRow[] }) {
  if (rows.length === 0) return null

  return (
    <Card className='gap-4 p-5 shadow-none'>
      <div className='flex items-center gap-2'>
        <Icon className='size-4 text-muted-foreground' />
        <h2 className='text-sm font-semibold'>{title}</h2>
      </div>
      <dl className='grid gap-x-8 gap-y-3 sm:grid-cols-2'>
        {rows.map((row) => (
          <div key={row.key} className='flex items-start justify-between gap-3 border-b border-dashed pb-2.5'>
            <dt className='text-sm text-muted-foreground'>{row.label}</dt>
            <dd className='max-w-[60%] text-right text-sm font-medium break-words'>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function StatTile({ label, value, accent }: { label: string; value: ReactNode; accent?: string }) {
  return (
    <Card className='gap-1 p-4 shadow-none'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className={cn('text-lg font-bold tabular-nums', accent)}>{value}</p>
    </Card>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8'>
      <Skeleton className='mb-6 h-5 w-64' />
      <Skeleton className='mb-4 h-10 w-80' />
      <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Skeleton className='h-20 rounded-xl' />
        <Skeleton className='h-20 rounded-xl' />
        <Skeleton className='h-20 rounded-xl' />
        <Skeleton className='h-20 rounded-xl' />
      </div>
      <div className='space-y-6'>
        <Skeleton className='h-48 w-full rounded-xl' />
        <Skeleton className='h-48 w-full rounded-xl' />
      </div>
    </div>
  )
}

export default function OrderPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()
  const { order, isGettingOrder } = useGetOrder({ id })
  const [copied, setCopied] = useState(false)

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

  const orderCode = order.idDonHangNhanh?.trim() || t('orders.detail.untitled')
  const status = order.trangThaiDonHang?.trim() ?? null
  const positive = isPositiveStatus(status)
  const details = order.orderNhanhVnDetails ?? []
  const emptyValue = t('orders.common.noDataShort')

  const noteRows = NOTE_FIELDS.map((key) => ({ key, value: order[key]?.trim() ?? '' })).filter(
    (row) => row.value !== ''
  )

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

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Breadcrumb */}
        <nav className='mb-5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground'>
          <Link
            to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`}
            className='shrink-0 transition-colors hover:text-foreground'
          >
            {t('orders.list.title')}
          </Link>
          <ChevronRightIcon className='size-3.5 shrink-0' />
          <span className='truncate font-medium text-foreground'>{orderCode}</span>
        </nav>

        {/* Header */}
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0 space-y-1.5'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='font-mono text-2xl font-bold tracking-tight'>{orderCode}</h1>
              {status && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                    positive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-muted-foreground/20 bg-muted text-muted-foreground'
                  )}
                >
                  <span
                    className={cn('size-1.5 rounded-full', positive ? 'bg-emerald-500' : 'bg-muted-foreground/50')}
                  />
                  {status}
                </span>
              )}
            </div>
            <p className='text-sm text-muted-foreground'>
              {order.thoiGianDonHang
                ? formatDateTime(order.thoiGianDonHang, 'dateTimeShort')
                : t('orders.common.noData')}
              {order.tenKhachHang?.trim() && (
                <>
                  <span className='mx-2 text-muted-foreground/40'>•</span>
                  {order.tenKhachHang.trim()}
                </>
              )}
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleCopyCode} disabled={!order.idDonHangNhanh?.trim()}>
              {copied ? <Link2Icon className='size-4 text-emerald-500' /> : <CopyIcon className='size-4' />}
              {t('orders.action.copyOrderId')}
            </Button>
          </div>
        </div>

        {/* Summary stats */}
        <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatTile
            label={t('orders.field.giaTriDonHang')}
            value={order.giaTriDonHang != null ? vndFormatter.format(order.giaTriDonHang) : emptyValue}
            accent='text-emerald-600 dark:text-emerald-400'
          />
          <StatTile
            label={t('orders.field.loiNhuan')}
            value={order.loiNhuan != null ? vndFormatter.format(order.loiNhuan) : emptyValue}
            accent={order.loiNhuan != null && order.loiNhuan < 0 ? 'text-rose-600 dark:text-rose-400' : undefined}
          />
          <StatTile
            label={t('orders.field.phiVanChuyen')}
            value={order.phiVanChuyen != null ? vndFormatter.format(order.phiVanChuyen) : emptyValue}
          />
          <StatTile label={t('orders.detail.itemCount')} value={numberFormatter.format(details.length)} />
        </div>

        {/* Detail sections */}
        <div className='space-y-6'>
          {SECTIONS.map((section) => (
            <SectionCard
              key={section.id}
              title={t(`orders.detail.section.${section.id}`)}
              icon={section.icon}
              rows={buildRows(section.fields, order, t)}
            />
          ))}

          {/* Notes */}
          {noteRows.length > 0 && (
            <Card className='gap-4 p-5 shadow-none'>
              <div className='flex items-center gap-2'>
                <StickyNoteIcon className='size-4 text-muted-foreground' />
                <h2 className='text-sm font-semibold'>{t('orders.detail.section.notes')}</h2>
              </div>
              <div className='space-y-4'>
                {noteRows.map((row) => (
                  <div key={row.key} className='space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>{t(`orders.field.${row.key}`)}</p>
                    <p className='text-sm whitespace-pre-wrap'>{row.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Line items */}
          <Card className='gap-4 p-5 shadow-none'>
            <div className='flex items-center gap-2'>
              <PackageIcon className='size-4 text-muted-foreground' />
              <h2 className='text-sm font-semibold'>{t('orders.detail.section.lineItems')}</h2>
              <Badge variant='secondary' className='font-normal'>
                {numberFormatter.format(details.length)}
              </Badge>
            </div>

            {details.length === 0 ? (
              <p className='py-6 text-center text-sm text-muted-foreground'>{t('orders.detail.noItems')}</p>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead className='text-muted-foreground text-sm font-medium'>
                        {t('orders.productTable.name')}
                      </TableHead>
                      {LINE_ITEM_FIELDS.map((field) => (
                        <TableHead
                          key={field.key}
                          className={cn(
                            'text-muted-foreground text-sm font-medium whitespace-nowrap',
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
          </Card>
        </div>

        <Separator className='my-8' />
        <Button variant='outline' asChild>
          <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/orders`}>{t('orders.detail.backToList')}</Link>
        </Button>
      </div>
    </div>
  )
}
