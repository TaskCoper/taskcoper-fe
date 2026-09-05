import type { I18nKey } from '@/lib/i18n/types'
import type { NhanhOrderStatusValue } from './nhanh-order-status'

export const OrderStatus = {
  Paid: 'Paid',
  Pending: 'Pending',
  Cancelled: 'Cancelled'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusLabel: Record<OrderStatus, I18nKey> = {
  [OrderStatus.Paid]: 'orders.status.paid' as I18nKey,
  [OrderStatus.Pending]: 'orders.status.pending' as I18nKey,
  [OrderStatus.Cancelled]: 'orders.status.cancelled' as I18nKey
}

export const OrderStatusStyle: Record<OrderStatus, { dot: string; badge: string }> = {
  [OrderStatus.Paid]: {
    dot: 'bg-emerald-500',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
  },
  [OrderStatus.Pending]: {
    dot: 'bg-amber-500',
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400'
  },
  [OrderStatus.Cancelled]: {
    dot: 'bg-rose-500',
    badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400'
  }
}

/**
 * A NhanhVn order returned by GET /v1/nhanh-vn/orders.
 * `string | null` / `number | null` fields are nullable on the server.
 * Date fields are ISO-8601 strings (DateTimeOffset, e.g. 2026-07-26T10:30:00+07:00).
 */
export interface Order {
  id: string // Guid
  idDonHangNhanh: string | null
  idDonHangApi: string | null
  loaiDon: string | null
  thoiGianDonHang: string | null // DateTimeOffset
  nguoiTaoDon: string | null
  cuaHang: string | null
  nguon: string | null
  khoTaoDon: string | null
  thanhPhoKhoHang: string | null
  quanHuyenKhoHang: string | null
  khoLayHang: string | null
  thanhPhoLayHang: string | null
  quanHuyenLayHang: string | null
  tenKhachHang: string | null
  maKhachHang: string | null
  soDienThoaiKhachHang: string | null
  emailKhachHang: string | null
  capDoKhachHang: string | null
  ngaySinhKhachHang: string | null // DateTimeOffset
  thanhPhoKhachHang: string | null
  quanHuyenKhachHang: string | null
  phuongXaKhachHang: string | null
  diaChiKhachHang: string | null
  tongKhoiLuong: number | null
  giaTriDonHang: number | null
  phiVanChuyen: number | null
  phiVuotCan: number | null
  phiKhaiGia: number | null
  phiChuyenHoan: number | null
  phiThuTienHo: number | null
  phiShipBaoKhach: number | null
  congVanChuyen: string | null
  hangVanChuyen: string | null
  dichVuVanChuyen: string | null
  soNgayChuyenHang: number | null
  maVanDon: string | null
  bienBan: string | null
  tienChuyenKhoan: number | null
  taiKhoanChuyenKhoan: string | null
  tienChietKhau: number | null
  tienDatCoc: number | null
  taiKhoanDatCoc: string | null
  tongThu: number | null
  taiKhoanQuetThe: string | null
  tienQuetThe: number | null
  maGiaoDichQuetThe: string | null
  ghiChuNoiBo: string | null
  ghiChuCuaKhach: string | null
  trangThaiHoaDonDienTu: string | null
  soHoaDonDienTu: string | null
  ngayXuatHoaDonDienTu: string | null // DateTimeOffset
  maCoQuanThueHoaDonDienTu: string | null
  trangThaiDonHang: NhanhOrderStatusValue
  lyDoHuy: string | null
  nhanVienChamSocKhachHang: string | null
  ngayXacNhan: string | null // DateTimeOffset
  ngayGuiHangVanChuyen: string | null // DateTimeOffset
  ngayBanGiao: string | null // DateTimeOffset
  ngayThanhCong: string | null // DateTimeOffset
  gioThanhCong: string | null
  nguonDonHang: string | null
  ghiChuHangVanChuyen: string | null
  canNangHangVanChuyen: number | null
  maGiamGia: string | null
  idDonTra: string | null
  idDonGoc: string | null
  soThuTuTheoNgay: number | null
  bienBanBanGiao: string | null
  maAffiliate: string | null
  nhomKhachHang: string | null
  tienVat: number | null
  tyLeVat: string | null
  tienTieuDiem: number | null
  nhan: string | null
  ngayHenThanhToan: string | null // DateTimeOffset
  trangThaiDoiSoat: string | null
  ngayDoiSoat: string | null // DateTimeOffset
  trangThaiThanhToanDoanhNghiep: string | null
  ngayThanhToanDoanhNghiep: string | null // DateTimeOffset
  nhanVienBanHang: string | null
  loiNhuan: number | null
  tyLeLoiNhuan: string | null
  facebookPsid: string | null
  facebookPageUserId: string | null
  soDienThoaiFacebook: string | null
  giaTriFacebook: string | null
  idPhapNhan: string | null
  maSoThue: string | null
  emailNguoiLienHe: string | null
  emailNguoiLienHeThuHai: string | null
  soDienThoaiNguoiLienHe: string | null
  tenNguoiLienHe: string | null
  maThamChieu: string | null
  diaChiKhachHangTrenHoaDonDienTu: string | null
  tenKhachHangTrenHoaDonDienTu: string | null
  loaiKhachHangHoaDon: string | null
  coLayHoaDon: string | null
  maCoQuanThueHoaDon: string | null
  soHoaDon: string | null
  ngayPhatHanhHoaDon: string | null // DateTimeOffset
  createdAt: string // DateTimeOffset (non-nullable)
  updatedAt: string | null // DateTimeOffset
  orderNhanhVnDetails: OrderDetailRow[]
}

/** A single line item within a NhanhVn order. */
export interface OrderDetailRow {
  id: string // Guid
  orderNhanhVnId: string | null // Guid
  tenSanPham: string | null
  quaTangKem: string | null
  imei: string | null
  loHang: string | null
  maSanPhamCha: string | null
  tenSanPhamCha: string | null
  maSanPham: string | null
  maVach: string | null
  danhMucSanPham: string | null
  khoiLuongSanPham: number | null
  giaBan: number | null
  loaiGiaSanPham: string | null
  giaBanTruocVat: number | null
  tienVatSanPham: number | null
  soLuong: number | null
  chietKhauMotSanPham: number | null
  chietKhauSanPham: number | null
  giaSanPhamSauChietKhau: number | null
  ghiChuSanPham: string | null
  giaVon: number | null
  giaVonDonHang: number | null
  donViTinh: string | null
  soLuongDonViNhoNhat: number | null
  nhanVienDongGoi: string | null
  createdAt: string // DateTimeOffset (non-nullable)
  updatedAt: string | null // DateTimeOffset
}

export type ShippingLocationType = 'CITY' | 'WARD'

export interface ShippingLocation {
  id: number
  name: string
}

interface SystemOrderCoordinates {
  latitude: number
  longitude: number
  ward: number
  city: number
  address: string
  shortAddress: string
}

interface SystemOrderShippingTracking {
  trackNumber: string
  nhanhOrderId: number | null
  nhanhTrackingUrl: string | null
  ahahaMoveOrderId: string | null
  ahahaMoveTrackingUrl: string | null
}

interface SystemOrderFees {
  shippingFee: number
  productFee: number
  totalFee: number
}

interface SystemOrderInvoice {
  taxCode: string | null
  identityNumber: string | null
  receiptFullName: string | null
  receiptPhoneNumber: string | null
  receiptAddress: string | null
  receiptEmail: string | null
  isExportInvoice: boolean
  vat: number
  invoiceType: number | null
}

/** A system order returned by GET /v1/orders/admin. */
export interface SystemOrder
  extends SystemOrderCoordinates, SystemOrderShippingTracking, SystemOrderFees, SystemOrderInvoice {
  orderId: string // Guid
  fullName: string
  phone: string
  remarks: string
  status: OrderStatus
  paymentUrl: string
  qrUrl: string | null
  orderTime: number
  tagIds: number[]
  paymentMethod: number
  createAt: string // DateTimeOffset
  updateAt: string | null // DateTimeOffset
  userId: string // Guid
}

/** A material line captured on the product snapshot at the time the order was placed. */
export interface SystemOrderMaterialSnapshot {
  matId: string // Guid
  name: string | null
  quantity: number | null
  price: number | null
  isCore: boolean
}

/** Product snapshot stored on an order line item. */
export interface SystemOrderItemSnapshot {
  subId: string | null // Guid
  materials: SystemOrderMaterialSnapshot[] | null
}

/** A single line item within a system order. */
export interface SystemOrderItem {
  orderDetailsId: string // Guid
  productId: string | null // Guid
  parentProductId: string | null // Guid
  name: string | null
  parentProductName: string | null
  coverImage: string | null
  itemId: number | null
  number: number | null
  price: number | null
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  snapshot: SystemOrderItemSnapshot | null
}

/** Payment transaction attached to a paid system order. */
export interface SystemOrderTransaction {
  transferAmount: number | null
  code: string | null
  gateway: string | null
  transactionDate: string | null // DateTimeOffset
}

/**
 * A system order returned by GET /v1/orders/{id}.
 * Shares most of its shape with `SystemOrder` (the list row) but exposes line items,
 * the receiver contact and the payment transaction instead of the list-only fields.
 */
export interface SystemOrderDetail extends SystemOrderCoordinates, SystemOrderFees {
  orderId: string // Guid
  status: OrderStatus
  fullName: string | null
  phone: string | null
  fullNameReceiver: string | null
  phoneReceiver: string | null
  userId: string // Guid
  remark: string | null
  orderTime: number | null
  tagsId: number[] | null
  createAt: string // DateTimeOffset

  // Shipping
  trackNumber: string | null
  ahahaMoveOrderId: string | null
  ahahaMoveTrackingUrl: string | null

  // Payment
  paymentMethod: number | null
  paymentUrl: string | null
  sepayUrl: string | null
  transaction: SystemOrderTransaction | null

  // Invoice
  isExportInvoice: boolean
  invoiceType: number | null
  taxCode: string | null
  identityNumber: string | null
  receiptFullName: string | null
  receiptPhoneNumber: string | null
  receiptAddress: string | null
  receiptEmail: string | null
  vatFee: number | null

  details: SystemOrderItem[] | null
}

/** Minimal shape needed to edit an order's shipping details - satisfied by both `SystemOrder` and `SystemOrderDetail`. */
export interface EditableSystemOrder {
  orderId: string
  trackNumber: string | null
  ahahaMoveTrackingUrl: string | null
  shippingFee: number | null
}
