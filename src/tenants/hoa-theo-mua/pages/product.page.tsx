import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatCard from '@/features/projects/core/components/stat-card'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  BoxIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ImageIcon,
  InfoIcon,
  LayersIcon,
  Link2Icon,
  type LucideIcon,
  PackageIcon,
  ScanBarcodeIcon,
  SlidersHorizontalIcon,
  StoreIcon,
  TagIcon,
  WalletIcon,
  ZoomInIcon
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import ProductCategoriesEditor from '../features/products/components/product-categories-editor'
import { useGetProduct } from '../features/products/hooks/use-get-product'
import type { Product } from '../features/products/types'
import { formatPrice, formatQuantity, parseNumber, productDetailToProduct } from '../features/products/utils'

type FieldFormat = 'text' | 'price' | 'quantity'

/** Keys of Product whose value is a string (or null) - excludes numeric fields like sourceRowNumber. */
type ProductStringKey = { [K in keyof Product]: Product[K] extends string | null ? K : never }[keyof Product]

interface FieldConfig {
  key: ProductStringKey
  label: string
  format?: FieldFormat
}

/** Compact set of the most useful facts, surfaced in the overview panel. */
const OVERVIEW_FIELDS: FieldConfig[] = [
  { key: 'productType', label: 'products.field.productType' },
  { key: 'brand', label: 'products.field.brand' },
  { key: 'supplier', label: 'products.field.supplier' },
  { key: 'origin', label: 'products.field.origin' },
  { key: 'unit', label: 'products.field.unit' },
  { key: 'barcode', label: 'products.field.barcode' },
  { key: 'warrantyMonthsRaw', label: 'products.field.warrantyMonths', format: 'quantity' },
  { key: 'weightRaw', label: 'products.field.weight', format: 'quantity' }
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

/** Collapsible specification groups shown in the Specifications tab accordion. */
const SPEC_GROUPS: { section: string; label: string; icon: LucideIcon; fields: FieldConfig[] }[] = [
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

const TAB_VALUES = ['overview', 'specifications', 'pricing', 'inventory'] as const

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

/** Admin-style key/value table for a set of product facts. */
function SpecTable({ rows, t, header }: { rows: SpecRow[]; t: TenantT; header?: boolean }) {
  if (rows.length === 0) {
    return <p className='py-6 text-center text-sm text-muted-foreground'>{t('products.common.noData')}</p>
  }

  return (
    <Table>
      {header && (
        <TableHeader>
          <TableRow>
            <TableHead className='w-1/2'>{t('products.detail.table.field')}</TableHead>
            <TableHead className='w-1/2 text-right'>{t('products.detail.table.value')}</TableHead>
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className='w-1/2 whitespace-normal align-top text-muted-foreground'>{t(row.label)}</TableCell>
            <TableCell className='w-1/2 whitespace-normal text-right align-top font-medium'>{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='space-y-5 bg-muted/50 px-4 pt-6 sm:px-6 lg:px-8'>
        <Skeleton className='h-5 w-72' />
        <div className='space-y-2'>
          <Skeleton className='h-8 w-80' />
          <Skeleton className='h-4 w-56' />
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-[82px] w-full rounded-2xl' />
          ))}
        </div>
        <div className='flex gap-2 border-b'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-10 w-28' />
          ))}
        </div>
      </div>
      <div className='grid gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-5'>
        <Skeleton className='aspect-square w-full rounded-xl lg:col-span-2' />
        <div className='space-y-4 lg:col-span-3'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-48 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

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

  const { coverImage, productName, otherName, productCode, categoryName, brand, supplier, productLabel, status, slug } =
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

  const statusText =
    status?.trim() || (available && available > 0 ? t('products.detail.inStock') : t('products.detail.outOfStock'))
  const websiteUrl = slug?.trim()?.startsWith('http') ? slug.trim() : null

  const overviewRows = buildRows(OVERVIEW_FIELDS, product)
  const pricingRows = buildRows(PRICING_FIELDS, product)
  const inventoryRows = buildRows(INVENTORY_FIELDS, product)

  const totalStock = parseNumber(product.totalStockRaw)
  const inventoryBars = INVENTORY_BAR_FIELDS.map((field) => ({
    label: field.label,
    value: parseNumber(product[field.key])
  })).filter((bar): bar is { label: string; value: number } => bar.value !== null)
  const barDenominator = Math.max(totalStock ?? 0, ...inventoryBars.map((bar) => bar.value), 1)

  const rawTab = searchParams.get('tab')
  const currentTab = TAB_VALUES.includes(rawTab as (typeof TAB_VALUES)[number]) ? rawTab! : 'overview'

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', value)
    setSearchParams(next, { replace: true })
  }

  const handleCopyCode = async () => {
    const code = productCode?.trim()
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)
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
    { value: 'overview', label: t('products.detail.tab.overview') },
    { value: 'specifications', label: t('products.detail.tab.specifications') },
    { value: 'pricing', label: t('products.detail.tab.pricing') },
    { value: 'inventory', label: t('products.detail.tab.inventory') }
  ]

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <Tabs value={currentTab} onValueChange={handleTabChange} className='flex flex-col'>
        {/* Dashboard header */}
        <div className='space-y-5 bg-muted/50 px-4 pt-6 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
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

          {/* Title + actions */}
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='min-w-0 space-y-2'>
              <div className='flex flex-wrap items-center gap-2.5'>
                <h1 className='text-2xl font-bold leading-tight tracking-tight'>{displayName}</h1>
                <Badge
                  variant='secondary'
                  className={cn(
                    'gap-1.5 font-medium',
                    active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : ''
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
                  {statusText}
                </Badge>
              </div>
              {otherName?.trim() && <p className='text-sm text-muted-foreground'>{otherName}</p>}
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
                {productCode?.trim() && (
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
                )}
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              {websiteUrl && (
                <Button variant='outline' size='sm' asChild>
                  <a href={websiteUrl} target='_blank' rel='noreferrer'>
                    <ExternalLinkIcon className='size-3.5' />
                    {t('products.detail.viewOnWebsite')}
                  </a>
                </Button>
              )}
              <Button variant='outline' size='sm' onClick={handleCopyLink}>
                {linkCopied ? <CheckIcon className='size-3.5 text-emerald-500' /> : <Link2Icon className='size-3.5' />}
                {linkCopied ? t('products.detail.copied') : t('products.detail.share')}
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title={t('products.field.price')}
              value={salePrice ?? t('products.detail.priceUnknown')}
              icon={<TagIcon className='size-4 text-white' />}
              color='blue'
            />
            <StatCard
              title={t('products.field.availableForSale')}
              value={formatQuantity(product.availableForSaleRaw) ?? '-'}
              icon={<BoxIcon className='size-4 text-white' />}
              color='green'
            />
            <StatCard
              title={t('products.field.totalStock')}
              value={formatQuantity(product.totalStockRaw) ?? '-'}
              icon={<PackageIcon className='size-4 text-white' />}
              color='purple'
            />
            <StatCard
              title={t('products.column.status')}
              value={statusText}
              icon={<CircleDotIcon className='size-4 text-white' />}
              color={active ? 'emerald' : 'slate'}
            />
          </div>

          {/* Tabs */}
          <TabsList className='w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 flex-nowrap [&::-webkit-scrollbar]:hidden'>
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
        <div className='px-4 py-6 sm:px-6 lg:px-8'>
          {/* Overview */}
          <TabsContent value='overview' className='mt-0'>
            <div className='grid gap-6 lg:grid-cols-5'>
              {/* Gallery */}
              <div className='space-y-3 lg:col-span-2'>
                <Card className='overflow-hidden p-0 shadow-none'>
                  <button
                    type='button'
                    onClick={() => coverImage && setLightboxOpen(true)}
                    disabled={!coverImage}
                    className={cn(
                      'group relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted/30',
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
                </Card>

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

              {/* Details */}
              <div className='space-y-6 lg:col-span-3'>
                {/* Pricing summary */}
                <Card className='gap-3 py-4 shadow-none'>
                  <div className='flex items-center gap-2 px-6 text-base font-semibold'>
                    <WalletIcon className='size-4 text-muted-foreground' />
                    {t('products.field.price')}
                  </div>
                  <CardContent className='space-y-5'>
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
                        <span className='text-lg font-semibold text-muted-foreground'>
                          {t('products.detail.priceUnknown')}
                        </span>
                      )}
                      <p className='text-xs text-emerald-600 dark:text-emerald-400'>
                        {t('products.detail.vatIncluded')}
                      </p>
                    </div>

                    {(product.color?.trim() || product.size?.trim()) && (
                      <>
                        <Separator />
                        <div className='flex flex-wrap gap-6'>
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
                      </>
                    )}

                    {available !== null && (
                      <div className='flex flex-wrap items-center gap-3'>
                        <span className='inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm'>
                          <span className='text-muted-foreground'>{t('products.field.availableForSale')}</span>
                          <span className='font-semibold tabular-nums'>
                            {formatQuantity(product.availableForSaleRaw)}
                          </span>
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
                  </CardContent>
                </Card>

                {/* Supplier */}
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

                {/* Key details */}
                <Card className='gap-3 py-4 shadow-none'>
                  <div className='flex items-center gap-2 px-6 text-base font-semibold'>
                    <InfoIcon className='size-4 text-muted-foreground' />
                    {t('products.detail.information')}
                  </div>
                  <CardContent>
                    <SpecTable rows={overviewRows} t={t} />
                  </CardContent>
                </Card>

                {/* Category membership editor */}
                <ProductCategoriesEditor product={product} />
              </div>
            </div>
          </TabsContent>

          {/* Specifications */}
          <TabsContent value='specifications' className='mt-0'>
            <Card className='gap-3 py-4 shadow-none'>
              <div className='space-y-1 px-6'>
                <div className='flex items-center gap-2 text-base font-semibold'>
                  <SlidersHorizontalIcon className='size-4 text-muted-foreground' />
                  {t('products.detail.tab.specifications')}
                </div>
                <p className='text-sm text-muted-foreground'>{t('products.detail.section.attributes')}</p>
              </div>
              <CardContent>
                <Accordion type='multiple' defaultValue={SPEC_GROUPS.map((group) => group.section)}>
                  {SPEC_GROUPS.map((group) => {
                    const rows = buildRows(group.fields, product)
                    const Icon = group.icon
                    return (
                      <AccordionItem key={group.section} value={group.section}>
                        <AccordionTrigger className='hover:no-underline'>
                          <span className='flex items-center gap-2'>
                            <Icon className='size-4 text-muted-foreground' />
                            {t(group.label)}
                            <Badge variant='secondary' className='ml-1 font-normal'>
                              {rows.length}
                            </Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <SpecTable rows={rows} t={t} />
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value='pricing' className='mt-0'>
            <Card className='gap-3 py-4 shadow-none'>
              <div className='flex items-center gap-2 px-6 text-base font-semibold'>
                <WalletIcon className='size-4 text-muted-foreground' />
                {t('products.detail.section.pricing')}
              </div>
              <CardContent>
                <SpecTable rows={pricingRows} t={t} header />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value='inventory' className='mt-0'>
            <div className='space-y-6'>
              {inventoryBars.length > 0 && (
                <Card className='gap-3 py-4 shadow-none'>
                  <div className='space-y-1 px-6'>
                    <div className='flex items-center gap-2 text-base font-semibold'>
                      <BoxIcon className='size-4 text-muted-foreground' />
                      {t('products.detail.section.inventory')}
                    </div>
                    {totalStock !== null && (
                      <p className='text-sm text-muted-foreground'>
                        <span className='font-semibold text-foreground'>{formatQuantity(product.totalStockRaw)}</span>{' '}
                        {t('products.detail.totalUnits')}
                      </p>
                    )}
                  </div>
                  <CardContent>
                    <div className='grid gap-x-8 gap-y-4 sm:grid-cols-2'>
                      {inventoryBars.map((bar) => (
                        <div key={bar.label} className='space-y-1.5'>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='text-muted-foreground'>{t(bar.label)}</span>
                            <span className='font-medium tabular-nums'>{formatQuantity(String(bar.value))}</span>
                          </div>
                          <Progress value={Math.min(100, Math.round((bar.value / barDenominator) * 100))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className='gap-3 py-4 shadow-none'>
                <div className='flex items-center gap-2 px-6 text-base font-semibold'>
                  <PackageIcon className='size-4 text-muted-foreground' />
                  {t('products.detail.tab.inventory')}
                </div>
                <CardContent>
                  <SpecTable rows={inventoryRows} t={t} header />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

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
