import { FileTextIcon, InfoIcon, LayersIcon, SlidersHorizontalIcon, type LucideIcon } from 'lucide-react'
import type { Product } from '../../types'
import { formatPrice, formatQuantity } from '../../utils'

type FieldFormat = 'text' | 'price' | 'quantity' | 'decimal'

type ProductStringKey = { [K in keyof Product]-?: Product[K] extends string | null ? K : never }[keyof Product]

export interface FieldConfig {
  key: ProductStringKey
  label: string
  format?: FieldFormat
}

export const BASIC_INFO_FIELDS: FieldConfig[] = [
  { key: 'productType', label: 'products.field.productType' },
  { key: 'productCode', label: 'products.field.productCode' },
  { key: 'barcode', label: 'products.field.barcode' },
  { key: 'status', label: 'products.column.status' },
  { key: 'unit', label: 'products.field.unit' },
  { key: 'categoryName', label: 'products.field.categoryName' },
  { key: 'brand', label: 'products.field.brand' },
  { key: 'supplier', label: 'products.field.supplier' },
  { key: 'productLabel', label: 'products.field.productLabel' },
  { key: 'weightRaw', label: 'products.field.weight', format: 'quantity' },
  { key: 'warrantyMonthsRaw', label: 'products.field.warrantyMonths', format: 'quantity' },
  { key: 'parentProductName', label: 'products.field.parentProductName' },
  { key: 'parentProductCode', label: 'products.field.parentProductCode' }
]

export const PRICING_OVERVIEW_FIELDS: FieldConfig[] = [
  { key: 'priceRaw', label: 'products.field.price', format: 'price' },
  { key: 'priceWithVatRaw', label: 'products.field.priceWithVat', format: 'price' },
  { key: 'oldPriceRaw', label: 'products.field.oldPrice', format: 'price' },
  { key: 'importPriceRaw', label: 'products.field.importPrice', format: 'price' },
  { key: 'importPriceWithVatRaw', label: 'products.field.importPriceWithVat', format: 'price' },
  { key: 'costPriceRaw', label: 'products.field.costPrice', format: 'price' },
  { key: 'profitPercentageRaw', label: 'products.field.profitPercentage', format: 'decimal' },
  { key: 'vatRaw', label: 'products.field.vat' },
  { key: 'saleVatMode', label: 'products.field.saleVatMode' },
  { key: 'importVatMode', label: 'products.field.importVatMode' },
  { key: 'wholesalePriceRaw', label: 'products.field.wholesalePrice', format: 'price' }
]

export const ATTRIBUTE_OVERVIEW_FIELDS: FieldConfig[] = [
  { key: 'color', label: 'products.field.color' },
  { key: 'size', label: 'products.field.size' },
  { key: 'unit', label: 'products.field.unit' },
  { key: 'origin', label: 'products.field.origin' },
  { key: 'lengthRaw', label: 'products.field.length', format: 'quantity' },
  { key: 'widthRaw', label: 'products.field.width', format: 'quantity' },
  { key: 'heightRaw', label: 'products.field.height', format: 'quantity' }
]

const IDENTITY_FIELDS: FieldConfig[] = [
  { key: 'nhanhProductId', label: 'products.field.nhanhProductId' },
  { key: 'productCode', label: 'products.field.productCode' },
  { key: 'barcode', label: 'products.field.barcode' },
  { key: 'otherName', label: 'products.field.otherName' },
  { key: 'slug', label: 'products.field.slug' },
  { key: 'parentProductId', label: 'products.field.parentProductId' },
  { key: 'parentProductCode', label: 'products.field.parentProductCode' },
  { key: 'parentProductName', label: 'products.field.parentProductName' }
]

const CLASSIFICATION_FIELDS: FieldConfig[] = [
  { key: 'productType', label: 'products.field.productType' },
  { key: 'categoryName', label: 'products.field.categoryName' },
  { key: 'categoryCode', label: 'products.field.categoryCode' },
  { key: 'internalCategoryCode', label: 'products.field.internalCategoryCode' },
  { key: 'brand', label: 'products.field.brand' },
  { key: 'supplier', label: 'products.field.supplier' },
  { key: 'productLabel', label: 'products.field.productLabel' }
]

const ATTRIBUTE_FIELDS: FieldConfig[] = [
  { key: 'unit', label: 'products.field.unit' },
  { key: 'size', label: 'products.field.size' },
  { key: 'color', label: 'products.field.color' },
  { key: 'origin', label: 'products.field.origin' },
  { key: 'weightRaw', label: 'products.field.weight', format: 'quantity' },
  { key: 'lengthRaw', label: 'products.field.length', format: 'quantity' },
  { key: 'widthRaw', label: 'products.field.width', format: 'quantity' },
  { key: 'heightRaw', label: 'products.field.height', format: 'quantity' },
  { key: 'warrantyMonthsRaw', label: 'products.field.warrantyMonths', format: 'quantity' },
  { key: 'warrantyAddress', label: 'products.field.warrantyAddress' }
]

const META_FIELDS: FieldConfig[] = [
  { key: 'nhanhCreatedAtRaw', label: 'products.field.createdAt' },
  { key: 'webOrderRaw', label: 'products.field.webOrder' }
]

export const SPEC_GROUPS: { section: string; label: string; icon: LucideIcon; fields: FieldConfig[] }[] = [
  { section: 'identity', label: 'products.detail.section.identity', icon: InfoIcon, fields: IDENTITY_FIELDS },
  {
    section: 'classification',
    label: 'products.detail.section.classification',
    icon: LayersIcon,
    fields: CLASSIFICATION_FIELDS
  },
  {
    section: 'attributes',
    label: 'products.detail.section.attributes',
    icon: SlidersHorizontalIcon,
    fields: ATTRIBUTE_FIELDS
  },
  { section: 'meta', label: 'products.detail.section.meta', icon: FileTextIcon, fields: META_FIELDS }
]

export const PRICING_FIELDS: FieldConfig[] = [
  { key: 'priceRaw', label: 'products.field.price', format: 'price' },
  { key: 'priceWithVatRaw', label: 'products.field.priceWithVat', format: 'price' },
  { key: 'oldPriceRaw', label: 'products.field.oldPrice', format: 'price' },
  { key: 'importPriceRaw', label: 'products.field.importPrice', format: 'price' },
  { key: 'importVatRaw', label: 'products.field.importVat' },
  { key: 'importVatMode', label: 'products.field.importVatMode' },
  { key: 'importPriceWithVatRaw', label: 'products.field.importPriceWithVat', format: 'price' },
  { key: 'costPriceRaw', label: 'products.field.costPrice', format: 'price' },
  { key: 'profitPercentageRaw', label: 'products.field.profitPercentage', format: 'decimal' },
  { key: 'vatRaw', label: 'products.field.vat' },
  { key: 'saleVatMode', label: 'products.field.saleVatMode' },
  { key: 'priceLabel', label: 'products.field.priceLabel' },
  { key: 'branchPriceRaw', label: 'products.field.branchPrice', format: 'price' },
  { key: 'branchPriceWithVatRaw', label: 'products.field.branchPriceWithVat', format: 'price' },
  { key: 'branchPriceDuplicateRaw', label: 'products.field.branchPriceDuplicate', format: 'price' },
  { key: 'wholesalePriceRaw', label: 'products.field.wholesalePrice', format: 'price' },
  { key: 'wholesalePriceWithVatRaw', label: 'products.field.wholesalePriceWithVat', format: 'price' },
  { key: 'wholesaleBranchPriceRaw', label: 'products.field.wholesaleBranchPrice', format: 'price' },
  { key: 'wholesaleBranchPriceWithVatRaw', label: 'products.field.wholesaleBranchPriceWithVat', format: 'price' },
  { key: 'wholesaleBranchPriceDuplicateRaw', label: 'products.field.wholesaleBranchPriceDuplicate', format: 'price' }
]

export const INVENTORY_FIELDS: FieldConfig[] = [
  { key: 'totalStockRaw', label: 'products.field.totalStock', format: 'quantity' },
  { key: 'stockRaw', label: 'products.field.stock', format: 'quantity' },
  { key: 'warehouseStockRaw', label: 'products.field.warehouseStock', format: 'quantity' },
  { key: 'availableForSaleRaw', label: 'products.field.availableForSale', format: 'quantity' },
  { key: 'deliveringStockRaw', label: 'products.field.deliveringStock', format: 'quantity' },
  { key: 'stockTransferringRaw', label: 'products.field.stockTransferring', format: 'quantity' },
  { key: 'heldRaw', label: 'products.field.held', format: 'quantity' },
  { key: 'heldComponentsRaw', label: 'products.field.heldComponents', format: 'quantity' },
  { key: 'preOrderRaw', label: 'products.field.preOrder', format: 'quantity' },
  { key: 'pendingImportStockRaw', label: 'products.field.pendingImportStock', format: 'quantity' },
  { key: 'warrantyStockRaw', label: 'products.field.warrantyStock', format: 'quantity' },
  { key: 'stockErrorRaw', label: 'products.field.stockError', format: 'quantity' }
]

export const TAB_VALUES = ['overview', 'specifications', 'pricing', 'inventory', 'variants', 'quantity'] as const

export interface SpecRow {
  label: string
  value: string
}

function formatValue(raw: string | null, format: FieldFormat | undefined): string | null {
  if (format === 'price') return formatPrice(raw)
  if (format === 'quantity') return formatQuantity(raw)
  if (format === 'decimal') {
    const value = raw == null ? Number.NaN : Number(raw)
    return Number.isFinite(value) ? value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : null
  }
  return raw?.trim() ? raw.trim() : null
}

export function isActiveStatus(status: string | null) {
  if (!status) return false
  const normalized = status.toLowerCase()
  return normalized.includes('bán') || normalized.includes('active') || normalized.includes('kinh doanh')
}

export function buildRows(fields: FieldConfig[], product: Product): SpecRow[] {
  return fields
    .map((field) => ({ label: field.label, value: formatValue(product[field.key], field.format) }))
    .filter((row): row is SpecRow => row.value !== null)
}
