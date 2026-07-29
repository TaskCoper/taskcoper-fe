import type { I18nKey } from '@/lib/i18n/types'

export const OrderStatus = {
  Paid: 'Paid',
  Pending: 'Pending'
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusLabel: Record<OrderStatus, I18nKey> = {
  [OrderStatus.Paid]: 'orders.status.paid',
  [OrderStatus.Pending]: 'orders.status.pending'
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
  trangThaiDonHang: string | null
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
