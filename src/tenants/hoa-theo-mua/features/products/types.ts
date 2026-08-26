import type { Category } from '../categories/types'

export const PRODUCT_TYPE_TAG = {
  combo: 1,
  product: 2,
  material: 3
} as const

export type ProductTypeTag = (typeof PRODUCT_TYPE_TAG)[keyof typeof PRODUCT_TYPE_TAG]

/** A product's category membership plus whether that specific product ↔ category pair is pinned. */
export interface ProductCategory extends Category {
  isPinned: boolean
}

export interface Product {
  id: string
  isPinned: boolean
  categories: ProductCategory[]
  parent: ProductDetail | null
  parentId: string | null

  otherImages: string[] | null

  sourceRowNumber: number

  // A - ID sản phẩm
  nhanhProductId: string | null

  // B - Id sản phẩm cha
  parentProductId: string | null

  // C - Mã sản phẩm cha
  parentProductCode: string | null

  // D - Tên sản phẩm cha
  parentProductName: string | null

  factor: number | null
  sellableQuantity: number | null
  stockStatus: string | null

  // E - Mã vạch
  barcode: string | null

  // F - Loại sản phẩm
  productType: string | null

  // G - Mã sản phẩm
  productCode: string | null

  // H - Tên sản phẩm
  productName: string | null

  // I - Tên khác
  otherName: string | null

  // J - Đơn vị tính
  unit: string | null

  // K - Link ảnh sản phẩm
  coverImage: string | null

  // L - Số tháng bảo hành
  warrantyMonthsRaw: string | null

  // M - Cân nặng cả vỏ hộp
  weightRaw: string | null

  // N - Giá nhập
  importPriceRaw: string | null

  // O - VAT nhập
  importVatRaw: string | null

  // P - Giá nhập + VAT
  importPriceWithVatRaw: string | null

  // Q - Vat Mode giá nhập
  importVatMode: string | null

  // R - Giá bán
  priceRaw: string | null

  // S - Giá bán + VAT
  priceWithVatRaw: string | null

  // T - Giá bán chi nhánh
  branchPriceRaw: string | null

  // U - Giá bán chi nhánh có VAT
  branchPriceWithVatRaw: string | null

  // V - Vat mode giá bán
  saleVatMode: string | null

  // W - Giá cũ
  oldPriceRaw: string | null

  // X - VAT
  vatRaw: string | null

  // Y - % Lợi nhuận
  profitPercentageRaw: string | null

  // Z - Giá vốn
  costPriceRaw: string | null

  // AA - Giá sỉ
  wholesalePriceRaw: string | null

  // AB - Giá sỉ + VAT
  wholesalePriceWithVatRaw: string | null

  // AC - Giá sỉ chi nhánh
  wholesaleBranchPriceRaw: string | null

  // AD - Giá sỉ chi nhánh có VAT
  wholesaleBranchPriceWithVatRaw: string | null

  // AE - Tổng tồn
  totalStockRaw: string | null

  // AF - Đang chuyển kho
  stockTransferringRaw: string | null

  // AG - Tồn
  stockRaw: string | null

  // AH - Đang Giao hàng
  deliveringStockRaw: string | null

  // AI - Tồn trong kho
  warehouseStockRaw: string | null

  // AJ - Lỗi
  stockErrorRaw: string | null

  // AK - Tạm giữ
  heldRaw: string | null

  // AL - Có thể bán
  availableForSaleRaw: string | null

  // AM - Bảo hành (tồn)
  warrantyStockRaw: string | null

  // AN - Tạm giữ linh kiện
  heldComponentsRaw: string | null

  // AO - Chờ nhập hàng
  pendingImportStockRaw: string | null

  // AP - Đặt trước
  preOrderRaw: string | null

  // AQ - Trạng thái
  status: string | null

  // Combo storefront publication status
  isActive: boolean | null

  // AR - Mã danh mục
  categoryCode: string | null

  // AS - Danh mục
  categoryName: string | null

  // AT - Mã danh mục nội bộ
  internalCategoryCode: string | null

  // AU - Thương hiệu
  brand: string | null

  // AV - Nhà cung cấp
  supplier: string | null

  // AW - Địa chỉ bảo hành
  warrantyAddress: string | null

  // AX - Link trên website
  slug: string | null

  // AY - Chiều dài
  lengthRaw: string | null

  // AZ - Chiều rộng
  widthRaw: string | null

  // BA - Chiều cao
  heightRaw: string | null

  // BB - Thứ tự trên Website
  webOrderRaw: string | null

  // BC - Ngày tạo
  nhanhCreatedAtRaw: string | null

  // BD - Nhãn sản phẩm
  productLabel: string | null

  // BE - Giá bán chi nhánh (trùng)
  branchPriceDuplicateRaw: string | null

  // BF - Giá sỉ chi nhánh (trùng)
  wholesaleBranchPriceDuplicateRaw: string | null

  // BG - Giá Tiền
  priceLabel: string | null

  // BH - Kích thước
  size: string | null

  // BI - Màu sắc
  color: string | null

  // BJ - Xuất xứ
  origin: string | null
}

/**
 * Slim product shape returned by GET /products-pin — the pinned storefront list.
 * Distinct from the full catalog `Product` row: prices arrive already parsed as numbers
 * and it carries an explicit sort `position`.
 */
export interface PinnedProduct {
  productId: string
  productCode: string | null
  productName: string | null
  coverImage: string | null
  price: number | null
  oldPrice: number | null
  position: number | null
}

type ProductRawFieldKey =
  | 'warrantyMonthsRaw'
  | 'weightRaw'
  | 'importPriceRaw'
  | 'importVatRaw'
  | 'importPriceWithVatRaw'
  | 'priceRaw'
  | 'priceWithVatRaw'
  | 'branchPriceRaw'
  | 'branchPriceWithVatRaw'
  | 'oldPriceRaw'
  | 'vatRaw'
  | 'profitPercentageRaw'
  | 'costPriceRaw'
  | 'wholesalePriceRaw'
  | 'wholesalePriceWithVatRaw'
  | 'wholesaleBranchPriceRaw'
  | 'wholesaleBranchPriceWithVatRaw'
  | 'totalStockRaw'
  | 'stockTransferringRaw'
  | 'stockRaw'
  | 'deliveringStockRaw'
  | 'warehouseStockRaw'
  | 'stockErrorRaw'
  | 'heldRaw'
  | 'availableForSaleRaw'
  | 'warrantyStockRaw'
  | 'heldComponentsRaw'
  | 'pendingImportStockRaw'
  | 'preOrderRaw'
  | 'lengthRaw'
  | 'widthRaw'
  | 'heightRaw'
  | 'webOrderRaw'
  | 'nhanhCreatedAtRaw'
  | 'branchPriceDuplicateRaw'
  | 'wholesaleBranchPriceDuplicateRaw'

export interface ProductDetail extends Omit<Product, ProductRawFieldKey> {
  warrantyMonths: number | null
  weight: number | null
  importPrice: number | null
  importVat: number | null
  importPriceWithVat: number | null

  price: number | null
  priceWithVat: number | null
  branchPrice: number | null
  branchPriceWithVat: number | null

  oldPrice: number | null
  vat: number | null
  profitPercentage: number | null
  costPrice: number | null

  wholesalePrice: number | null
  wholesalePriceWithVat: number | null
  wholesaleBranchPrice: number | null
  wholesaleBranchPriceWithVat: number | null

  totalStock: number | null
  stockTransferring: number | null
  stock: number | null
  deliveringStock: number | null
  warehouseStock: number | null
  stockError: number | null
  held: number | null
  availableForSale: number | null
  warrantyStock: number | null
  heldComponents: number | null
  pendingImportStock: number | null
  preOrder: number | null

  length: number | null
  width: number | null
  height: number | null

  webOrder: number | null
  nhanhCreatedAt: string | null

  branchPriceDuplicate: number | null
  wholesaleBranchPriceDuplicate: number | null

  createdAt: string
  updatedAt: string | null

  children: ProductDetail[] | null
}
