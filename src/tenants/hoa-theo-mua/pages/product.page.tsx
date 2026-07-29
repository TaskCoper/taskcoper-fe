import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  BoxIcon,
  CheckIcon,
  ChevronRightIcon,
  ImageIcon,
  Link2Icon,
  PackageIcon,
  ScanBarcodeIcon,
  StoreIcon,
  ZoomInIcon
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { useGetProduct } from '../features/products/hooks/use-get-product'
import type { Product } from '../features/products/types'
import { formatPrice, formatQuantity, parseNumber, productDetailToProduct } from '../features/products/utils'

type FieldFormat = 'text' | 'price' | 'quantity'

/** Keys of Product whose value is a string (or null) — excludes numeric fields like sourceRowNumber. */
type ProductStringKey = { [K in keyof Product]: Product[K] extends string | null ? K : never }[keyof Product]

interface FieldConfig {
  key: ProductStringKey
  label: string
  format?: FieldFormat
}

const SPECIFICATION_FIELDS: FieldConfig[] = [
  { key: 'productType', label: 'products.field.productType' },
  { key: 'categoryName', label: 'products.field.categoryName' },
  { key: 'categoryCode', label: 'products.field.categoryCode' },
  { key: 'internalCategoryCode', label: 'products.field.internalCategoryCode' },
  { key: 'brand', label: 'products.field.brand' },
  { key: 'supplier', label: 'products.field.supplier' },
  { key: 'productLabel', label: 'products.field.productLabel' },
  { key: 'unit', label: 'products.field.unit' },
  { key: 'size', label: 'products.field.size' },
  { key: 'color', label: 'products.field.color' },
  { key: 'origin', label: 'products.field.origin' },
  { key: 'weightRaw', label: 'products.field.weight', format: 'quantity' },
  { key: 'lengthRaw', label: 'products.field.length', format: 'quantity' },
  { key: 'widthRaw', label: 'products.field.width', format: 'quantity' },
  { key: 'heightRaw', label: 'products.field.height', format: 'quantity' },
  { key: 'warrantyMonthsRaw', label: 'products.field.warrantyMonths', format: 'quantity' },
  { key: 'warrantyAddress', label: 'products.field.warrantyAddress' },
  { key: 'nhanhProductId', label: 'products.field.nhanhProductId' },
  { key: 'productCode', label: 'products.field.productCode' },
  { key: 'barcode', label: 'products.field.barcode' },
  { key: 'parentProductId', label: 'products.field.parentProductId' },
  { key: 'parentProductCode', label: 'products.field.parentProductCode' },
  { key: 'parentProductName', label: 'products.field.parentProductName' },
  { key: 'otherName', label: 'products.field.otherName' },
  { key: 'slug', label: 'products.field.slug' },
  { key: 'nhanhCreatedAtRaw', label: 'products.field.createdAt' },
  { key: 'webOrderRaw', label: 'products.field.webOrder' }
]

const PRICING_FIELDS: FieldConfig[] = [
  { key: 'priceRaw', label: 'products.field.price', format: 'price' },
  { key: 'priceWithVatRaw', label: 'products.field.priceWithVat', format: 'price' },
  { key: 'oldPriceRaw', label: 'products.field.oldPrice', format: 'price' },
  { key: 'importPriceRaw', label: 'products.field.importPrice', format: 'price' },
  { key: 'importVatRaw', label: 'products.field.importVat' },
  { key: 'importVatMode', label: 'products.field.importVatMode' },
  { key: 'importPriceWithVatRaw', label: 'products.field.importPriceWithVat', format: 'price' },
  { key: 'costPriceRaw', label: 'products.field.costPrice', format: 'price' },
  { key: 'profitPercentageRaw', label: 'products.field.profitPercentage' },
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

const INVENTORY_FIELDS: FieldConfig[] = [
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

/** Inventory rows shown as breakdown bars in the inventory tab. */
const INVENTORY_BAR_FIELDS: { key: ProductStringKey; label: string }[] = [
  { key: 'availableForSaleRaw', label: 'products.field.availableForSale' },
  { key: 'stockRaw', label: 'products.field.stock' },
  { key: 'warehouseStockRaw', label: 'products.field.warehouseStock' },
  { key: 'deliveringStockRaw', label: 'products.field.deliveringStock' },
  { key: 'heldRaw', label: 'products.field.held' },
  { key: 'preOrderRaw', label: 'products.field.preOrder' }
]

/** Below the threshold we surface a "only N left" nudge, mirroring the storefront layout. */
const LOW_STOCK_THRESHOLD = 10

function formatValue(raw: string | null, format: FieldFormat | undefined): string | null {
  if (format === 'price') return formatPrice(raw)
  if (format === 'quantity') return formatQuantity(raw)
  return raw?.trim() ? raw.trim() : null
}

function isActiveStatus(status: string | null) {
  if (!status) return false
  const normalized = status.toLowerCase()
  return normalized.includes('bán') || normalized.includes('active') || normalized.includes('kinh doanh')
}

interface SpecRow {
  label: string
  value: string
}

function buildRows(fields: FieldConfig[], product: Product): SpecRow[] {
  return fields
    .map((field) => ({ label: field.label, value: formatValue(product[field.key], field.format) }))
    .filter((row): row is SpecRow => row.value !== null)
}

/** Storefront-style two-column check list of key/value facts. */
function SpecList({ rows, t }: { rows: SpecRow[]; t: TenantT }) {
  if (rows.length === 0) {
    return <p className='py-8 text-center text-sm text-muted-foreground'>{t('products.common.noData')}</p>
  }

  return (
    <ul className='grid gap-x-10 gap-y-3.5 sm:grid-cols-2'>
      {rows.map((row) => (
        <li key={row.label} className='flex items-start gap-2.5'>
          <span className='mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'>
            <CheckIcon className='size-3' strokeWidth={3} />
          </span>
          <span className='text-sm leading-relaxed'>
            <span className='text-muted-foreground'>{t(row.label)}: </span>
            <span className='font-medium'>{row.value}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='text-right text-sm font-medium'>{value}</dd>
    </div>
  )
}

function OptionPill({ label }: { label: string }) {
  return (
    <span className='inline-flex items-center rounded-full border-2 border-primary bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary'>
      {label}
    </span>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8'>
      <Skeleton className='mb-6 h-5 w-72' />
      <div className='grid gap-10 lg:grid-cols-2'>
        <div className='space-y-4'>
          <Skeleton className='aspect-square w-full rounded-2xl' />
          <div className='flex gap-3'>
            <Skeleton className='size-20 rounded-xl' />
            <Skeleton className='size-20 rounded-xl' />
            <Skeleton className='size-20 rounded-xl' />
          </div>
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-9 w-3/4' />
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-10 w-52' />
          <Skeleton className='h-11 w-full' />
          <Skeleton className='h-24 w-full rounded-2xl' />
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()

  const { product: fetchedDetail, isGettingProduct } = useGetProduct({
    id: id ?? ''
  })

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const product = fetchedDetail ? productDetailToProduct(fetchedDetail) : undefined

  if (isGettingProduct) return <ProductDetailSkeleton />

  if (!product) {
    return (
      <div className='mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center'>
        <span className='flex size-16 items-center justify-center rounded-2xl bg-muted'>
          <PackageIcon className='size-8 text-muted-foreground/50' />
        </span>
        <div className='space-y-1'>
          <h1 className='text-lg font-semibold'>{t('products.detail.notFound')}</h1>
          <p className='text-sm text-muted-foreground'>{t('products.detail.notFoundDescription')}</p>
        </div>
        <Button variant='outline' asChild>
          <Link to='..'>{t('products.detail.backToList')}</Link>
        </Button>
      </div>
    )
  }

  const { coverImage, productName, otherName, productCode, categoryName, brand, supplier, productLabel, status } =
    product

  const displayName = productName?.trim() || t('products.common.unnamed')
  const active = isActiveStatus(status)

  const salePrice = formatPrice(product.priceWithVatRaw ?? product.priceRaw)
  const currentPriceValue = parseNumber(product.priceWithVatRaw ?? product.priceRaw)
  const oldPriceValue = parseNumber(product.oldPriceRaw)
  const oldPrice = formatPrice(product.oldPriceRaw)
  const hasDiscount = currentPriceValue !== null && oldPriceValue !== null && oldPriceValue > currentPriceValue
  const discountPct = hasDiscount ? Math.round((1 - currentPriceValue! / oldPriceValue!) * 100) : null

  const available = parseNumber(product.availableForSaleRaw)
  const lowStock = available !== null && available > 0 && available <= LOW_STOCK_THRESHOLD

  // Compact key facts shown in the purchase panel — only real, non-empty fields.
  const infoRows: SpecRow[] = [
    { label: 'products.field.origin', value: product.origin?.trim() ?? '' },
    { label: 'products.field.brand', value: brand?.trim() ?? '' },
    { label: 'products.field.unit', value: product.unit?.trim() ?? '' },
    { label: 'products.field.warrantyMonths', value: formatQuantity(product.warrantyMonthsRaw) ?? '' }
  ].filter((row): row is SpecRow => row.value !== '')

  const specRows = buildRows(SPECIFICATION_FIELDS, product)
  const pricingRows = buildRows(PRICING_FIELDS, product)
  const inventoryRows = buildRows(INVENTORY_FIELDS, product)

  const totalStock = parseNumber(product.totalStockRaw)
  const inventoryBars = INVENTORY_BAR_FIELDS.map((field) => ({
    label: field.label,
    value: parseNumber(product[field.key])
  })).filter((bar): bar is { label: string; value: number } => bar.value !== null)
  const barDenominator = Math.max(totalStock ?? 0, ...inventoryBars.map((bar) => bar.value), 1)

  const handleCopyCode = async () => {
    const code = productCode?.trim()
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Breadcrumb + code chip */}
        <div className='mb-6 flex items-center justify-between gap-4'>
          <nav className='flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground'>
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products`}
              className='shrink-0 transition-colors hover:text-foreground'
            >
              {t('products.list.title')}
            </Link>
            {categoryName?.trim() && (
              <>
                <ChevronRightIcon className='size-3.5 shrink-0' />
                <span className='hidden truncate sm:inline'>{categoryName}</span>
              </>
            )}
            <ChevronRightIcon className='size-3.5 shrink-0' />
            <span className='truncate font-medium text-foreground'>{displayName}</span>
          </nav>
          {productCode?.trim() && (
            <span className='hidden shrink-0 font-mono text-xs font-semibold text-muted-foreground sm:inline'>
              {productCode}
            </span>
          )}
        </div>

        {/* Hero: gallery + purchase panel */}
        <div className='grid gap-10 lg:grid-cols-2'>
          {/* Left — gallery */}
          <div className='space-y-3'>
            <button
              type='button'
              onClick={() => coverImage && setLightboxOpen(true)}
              disabled={!coverImage}
              className={cn(
                'group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border bg-muted/30',
                coverImage && 'cursor-zoom-in'
              )}
              aria-label={t('products.detail.viewImage')}
            >
              {coverImage ? (
                <>
                  <img src={coverImage} alt={displayName} className='size-full object-contain p-8' />
                  <span className='absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100'>
                    <ZoomInIcon className='size-4' />
                  </span>
                </>
              ) : (
                <span className='flex flex-col items-center gap-2 text-muted-foreground/50'>
                  <ImageIcon className='size-16' />
                  <span className='text-xs'>{t('products.common.noData')}</span>
                </span>
              )}
              {discountPct !== null && (
                <span className='absolute left-4 top-4 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm'>
                  -{discountPct}%
                </span>
              )}
            </button>

            {/* Thumbnail rail */}
            {coverImage && (
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setLightboxOpen(true)}
                  className='size-20 overflow-hidden rounded-xl border-2 border-primary bg-muted/30'
                  aria-label={t('products.detail.viewImage')}
                >
                  <img src={coverImage} alt={displayName} className='size-full object-cover' />
                </button>
              </div>
            )}
          </div>

          {/* Right — purchase / info panel */}
          <div className='space-y-5'>
            {/* Category + labels */}
            <div className='flex flex-wrap items-center gap-2'>
              {categoryName?.trim() && (
                <Badge variant='secondary' className='font-normal'>
                  {categoryName}
                </Badge>
              )}
              {productLabel?.trim() && (
                <Badge className='border-amber-200 bg-amber-50 font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400'>
                  {productLabel}
                </Badge>
              )}
            </div>

            {/* Title + share */}
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0 space-y-1'>
                <h1 className='text-2xl font-bold leading-tight tracking-tight'>{displayName}</h1>
                {otherName?.trim() && <p className='text-sm text-muted-foreground'>{otherName}</p>}
              </div>
              <button
                type='button'
                onClick={handleCopyLink}
                className='flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
                title={t('products.detail.share')}
              >
                {linkCopied ? (
                  <>
                    <CheckIcon className='size-3.5 text-emerald-500' />
                    {t('products.detail.copied')}
                  </>
                ) : (
                  <>
                    <Link2Icon className='size-3.5' />
                    {t('products.detail.share')}
                  </>
                )}
              </button>
            </div>

            {/* Status + availability (storefront rating slot) */}
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm'>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 font-medium',
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                )}
              >
                <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
                {status?.trim() ||
                  (available && available > 0 ? t('products.detail.inStock') : t('products.detail.outOfStock'))}
              </span>
              {available !== null && (
                <>
                  <span className='text-muted-foreground/40'>•</span>
                  <span className='text-muted-foreground'>
                    {t('products.detail.availableCount', { count: available })}
                  </span>
                </>
              )}
              {productCode?.trim() && (
                <>
                  <span className='text-muted-foreground/40'>•</span>
                  <button
                    type='button'
                    onClick={handleCopyCode}
                    className='inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground'
                    title={t('products.detail.copyCode')}
                  >
                    {copied ? (
                      <CheckIcon className='size-3 text-emerald-500' />
                    ) : (
                      <ScanBarcodeIcon className='size-3' />
                    )}
                    {productCode}
                  </button>
                </>
              )}
            </div>

            <Separator />

            {/* Price */}
            <div className='space-y-1'>
              {salePrice ? (
                <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                  <span className='text-3xl font-bold tracking-tight'>{salePrice}</span>
                  {hasDiscount && oldPrice && (
                    <>
                      <span className='text-base text-muted-foreground line-through'>{oldPrice}</span>
                      <span className='text-sm font-semibold text-rose-600 dark:text-rose-400'>
                        ({discountPct}% {t('products.detail.off')})
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <span className='text-lg font-semibold text-muted-foreground'>{t('products.detail.priceUnknown')}</span>
              )}
              <p className='text-xs text-emerald-600 dark:text-emerald-400'>{t('products.detail.vatIncluded')}</p>
            </div>

            {/* Attribute options */}
            {(product.color?.trim() || product.size?.trim()) && (
              <div className='space-y-4'>
                {product.color?.trim() && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>{t('products.field.color')}</p>
                    <OptionPill label={product.color} />
                  </div>
                )}
                {product.size?.trim() && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>{t('products.field.size')}</p>
                    <OptionPill label={product.size} />
                  </div>
                )}
              </div>
            )}

            {/* Stock nudge (storefront quantity slot) */}
            {available !== null && (
              <div className='flex flex-wrap items-center gap-3'>
                <span className='inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm'>
                  <span className='text-muted-foreground'>{t('products.field.availableForSale')}</span>
                  <span className='font-semibold tabular-nums'>{formatQuantity(product.availableForSaleRaw)}</span>
                </span>
                {available <= 0 ? (
                  <span className='text-sm font-medium text-rose-600 dark:text-rose-400'>
                    {t('products.detail.outOfStock')}
                  </span>
                ) : lowStock ? (
                  <span className='text-sm font-medium text-amber-600 dark:text-amber-400'>
                    {t('products.detail.onlyLeft', { count: available })}
                  </span>
                ) : null}
              </div>
            )}

            {/* Supplier card (storefront seller slot) */}
            {(supplier?.trim() || brand?.trim()) && (
              <Card className='flex-row items-center justify-between gap-4 bg-muted/40 p-4 shadow-none'>
                <div className='flex min-w-0 items-center gap-3'>
                  <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm'>
                    <StoreIcon className='size-5' />
                  </span>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold'>{supplier?.trim() || brand?.trim()}</p>
                    <p className='text-xs text-muted-foreground'>{t('products.detail.suppliedBy')}</p>
                  </div>
                </div>
                {brand?.trim() && supplier?.trim() && (
                  <Badge variant='secondary' className='shrink-0 font-normal'>
                    {brand}
                  </Badge>
                )}
              </Card>
            )}

            {/* Key facts */}
            {infoRows.length > 0 && (
              <>
                <Separator />
                <dl className='space-y-2.5'>
                  {infoRows.map((row) => (
                    <InfoRow key={row.label} label={t(row.label)} value={row.value} />
                  ))}
                </dl>
              </>
            )}
          </div>
        </div>

        {/* Detail tabs */}
        <Tabs defaultValue='specifications' className='mt-12'>
          <TabsList className='h-11 w-full justify-start rounded-none border-b bg-transparent p-0'>
            <TabsTrigger
              value='specifications'
              className='rounded-none border-0 border-b-2 border-transparent px-4 text-base data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'
            >
              {t('products.detail.tab.specifications')}
            </TabsTrigger>
            <TabsTrigger
              value='pricing'
              className='rounded-none border-0 border-b-2 border-transparent px-4 text-base data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'
            >
              {t('products.detail.tab.pricing')}
            </TabsTrigger>
            <TabsTrigger
              value='inventory'
              className='rounded-none border-0 border-b-2 border-transparent px-4 text-base data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'
            >
              {t('products.detail.tab.inventory')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='specifications' className='pt-8'>
            <h2 className='mb-6 text-lg font-semibold'>{t('products.detail.section.attributes')}</h2>
            <SpecList rows={specRows} t={t} />
          </TabsContent>

          <TabsContent value='pricing' className='pt-8'>
            <h2 className='mb-6 text-lg font-semibold'>{t('products.detail.section.pricing')}</h2>
            <SpecList rows={pricingRows} t={t} />
          </TabsContent>

          <TabsContent value='inventory' className='space-y-8 pt-8'>
            {inventoryBars.length > 0 && (
              <Card className='gap-4 p-5 shadow-none'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <BoxIcon className='size-4 text-muted-foreground' />
                    <h2 className='text-sm font-semibold'>{t('products.detail.section.inventory')}</h2>
                  </div>
                  {totalStock !== null && (
                    <span className='text-sm text-muted-foreground'>
                      <span className='font-semibold text-foreground'>{formatQuantity(product.totalStockRaw)}</span>{' '}
                      {t('products.detail.totalUnits')}
                    </span>
                  )}
                </div>
                <div className='grid gap-x-8 gap-y-3 sm:grid-cols-2'>
                  {inventoryBars.map((bar) => (
                    <div key={bar.label} className='space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>{t(bar.label)}</span>
                        <span className='font-medium tabular-nums'>{formatQuantity(String(bar.value))}</span>
                      </div>
                      <Progress value={Math.min(100, Math.round((bar.value / barDenominator) * 100))} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <SpecList rows={inventoryRows} t={t} />
          </TabsContent>
        </Tabs>
      </div>

      {coverImage && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: coverImage, alt: displayName }]}
          carousel={{ finite: true }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      )}
    </div>
  )
}
