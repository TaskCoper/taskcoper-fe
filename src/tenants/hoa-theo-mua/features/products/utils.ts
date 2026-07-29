import { calculateReorderPosition } from '@/shared/utils'
import type { PinnedProduct, Product, ProductDetail } from './types'

/**
 * Position that appends `productId` after every *other* product currently pinned in a scope. Returns
 * `null` when there are no others (the sole pin can keep the server default). Shared by the single
 * pin flow and the multi-target pin manager so both compute the same clean, gapped positions and
 * avoid the duplicate-INITIAL_POSITION collisions that break ordering.
 */
export function resolveAppendPosition(pinned: PinnedProduct[], productId: string): number | null {
  const others = pinned.filter((product) => product.productId !== productId)
  if (others.length === 0) return null

  const sorted = [...others].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  return calculateReorderPosition(
    sorted.map((product) => ({ position: product.position ?? 0 })),
    sorted.length
  )
}

export const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

export const numberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2
})

/**
 * Parse a "raw" spreadsheet value (e.g. "1.234.567", "150,000", "12") into a number.
 * Treats every non-digit separator as grouping, so it is safe for integer VND prices / stock.
 * Returns null for empty / non-numeric input.
 */
export function parseNumber(raw: string | null | undefined): number | null {
  if (raw == null) return null

  const cleaned = String(raw).trim()
  if (!cleaned) return null

  const digits = cleaned.replace(/[^\d-]/g, '')
  if (!digits || digits === '-') return null

  const value = Number(digits)
  return Number.isFinite(value) ? value : null
}

/** Format a raw price value as VND, falling back to the raw string / null. */
export function formatPrice(raw: string | null | undefined): string | null {
  const value = parseNumber(raw)
  if (value === null) return raw?.trim() ? raw.trim() : null

  return vndFormatter.format(value)
}

/** Format a raw numeric value with vi-VN grouping, falling back to the raw string / null. */
export function formatQuantity(raw: string | null | undefined): string | null {
  const value = parseNumber(raw)
  if (value === null) return raw?.trim() ? raw.trim() : null

  return numberFormatter.format(value)
}

const numToRaw = (value: number | null): string | null => (value == null ? null : String(value))

/**
 * Map the parsed `ProductDetail` returned by the detail endpoint back onto the raw-string `Product`
 * shape used across the products UI (columns, detail page). Lets a single set of `formatPrice` /
 * `formatQuantity` renderers work whether the data came from the list row or a fresh fetch.
 */
export function productDetailToProduct(detail: ProductDetail): Product {
  return {
    ...detail,
    warrantyMonthsRaw: numToRaw(detail.warrantyMonths),
    weightRaw: numToRaw(detail.weight),
    importPriceRaw: numToRaw(detail.importPrice),
    importVatRaw: numToRaw(detail.importVat),
    importPriceWithVatRaw: numToRaw(detail.importPriceWithVat),
    priceRaw: numToRaw(detail.price),
    priceWithVatRaw: numToRaw(detail.priceWithVat),
    branchPriceRaw: numToRaw(detail.branchPrice),
    branchPriceWithVatRaw: numToRaw(detail.branchPriceWithVat),
    oldPriceRaw: numToRaw(detail.oldPrice),
    vatRaw: numToRaw(detail.vat),
    profitPercentageRaw: numToRaw(detail.profitPercentage),
    costPriceRaw: numToRaw(detail.costPrice),
    wholesalePriceRaw: numToRaw(detail.wholesalePrice),
    wholesalePriceWithVatRaw: numToRaw(detail.wholesalePriceWithVat),
    wholesaleBranchPriceRaw: numToRaw(detail.wholesaleBranchPrice),
    wholesaleBranchPriceWithVatRaw: numToRaw(detail.wholesaleBranchPriceWithVat),
    totalStockRaw: numToRaw(detail.totalStock),
    stockTransferringRaw: numToRaw(detail.stockTransferring),
    stockRaw: numToRaw(detail.stock),
    deliveringStockRaw: numToRaw(detail.deliveringStock),
    warehouseStockRaw: numToRaw(detail.warehouseStock),
    stockErrorRaw: numToRaw(detail.stockError),
    heldRaw: numToRaw(detail.held),
    availableForSaleRaw: numToRaw(detail.availableForSale),
    warrantyStockRaw: numToRaw(detail.warrantyStock),
    heldComponentsRaw: numToRaw(detail.heldComponents),
    pendingImportStockRaw: numToRaw(detail.pendingImportStock),
    preOrderRaw: numToRaw(detail.preOrder),
    lengthRaw: numToRaw(detail.length),
    widthRaw: numToRaw(detail.width),
    heightRaw: numToRaw(detail.height),
    webOrderRaw: numToRaw(detail.webOrder),
    nhanhCreatedAtRaw: detail.nhanhCreatedAt,
    branchPriceDuplicateRaw: numToRaw(detail.branchPriceDuplicate),
    wholesaleBranchPriceDuplicateRaw: numToRaw(detail.wholesaleBranchPriceDuplicate)
  }
}
