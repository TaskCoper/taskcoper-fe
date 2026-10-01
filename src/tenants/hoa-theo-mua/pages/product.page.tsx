import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SanitizedHtml from '@/components/sanitized-html'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatCard from '@/features/projects/core/components/stat-card'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { primaryButtonEffectClasses } from '@/shared/effects'
import { cn } from '@/shared/utils'
import {
  BoxIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  ImageIcon,
  Link2Icon,
  PackageIcon,
  ScanBarcodeIcon,
  ShoppingCartIcon,
  StarIcon,
  TagIcon,
  ZoomInIcon
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import ImageLightbox from '../components/image-lightbox'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { ComboSpecification } from '../features/products/combos/components/combo-specification'
import { useGetComboSpecification } from '../features/products/combos/hooks/use-get-combo-specification'
import { useUpdateComboPublication } from '../features/products/combos/hooks/use-update-combo-publication'
import ProductCategoriesEditor from '../features/products/components/product-categories-editor'
import ProductDescriptionDialog from '../features/products/components/product-description-dialog'
import {
  ATTRIBUTE_OVERVIEW_FIELDS,
  BASIC_INFO_FIELDS,
  buildRows,
  INVENTORY_FIELDS,
  PRICING_FIELDS,
  PRICING_OVERVIEW_FIELDS,
  SPEC_GROUPS,
  TAB_VALUES
} from '../features/products/components/product-detail/fields'
import {
  DetailRows,
  DetailSection,
  ProductDetailSkeleton,
  VariantRow
} from '../features/products/components/product-detail/parts'
import { useGetProduct } from '../features/products/hooks/use-get-product'
import { formatPrice, formatQuantity, parseNumber, productDetailToProduct } from '../features/products/utils'

export default function ProductPage() {
  const { t } = useTenantTranslation()
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const { product: fetchedDetail, isGettingProduct } = useGetProduct({
    id: id ?? ''
  })

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false)

  const [imageResetId, setImageResetId] = useState(id)
  if (id !== imageResetId) {
    setImageResetId(id)
    setActiveImageIndex(0)
  }

  const product = fetchedDetail ? productDetailToProduct(fetchedDetail) : undefined
  const variants = fetchedDetail?.children?.map((child) => productDetailToProduct(child)) ?? []
  const isCombo = product?.productType?.trim().toLowerCase() === 'combo'
  const hasVariants = variants.length > 0
  const areAllVariantsCombos =
    hasVariants && variants.every((variant) => variant.productType?.trim().toLowerCase() === 'combo')
  const isVariant = Boolean(product?.parentProductId?.trim())
  const canEditFactor = isVariant
  const canManageComboSpecification = isCombo || areAllVariantsCombos
  const canManageComboMaterials = !isVariant
  const isComboSpecificationRequested = searchParams.get('tab') === 'quantity'

  const {
    comboSpecification,
    isGettingComboSpecification,
    isError: isComboSpecificationError
  } = useGetComboSpecification({
    id: id ?? '',
    enabled: canManageComboSpecification && isComboSpecificationRequested
  })
  const { updateComboPublication, isUpdatingComboPublication } = useUpdateComboPublication()

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

  const {
    coverImage,
    otherImages,
    productName,
    otherName,
    productCode,
    categoryName,
    productLabel,
    slug,
    description
  } = product

  const displayName = productName?.trim() || t('products.common.unnamed')
  const comboId = product.parentProductId?.trim() || id || ''
  const publicationComboId = id || ''
  const isComboPublished = product.isActive ?? comboSpecification?.isActive ?? false
  const parent = product.parent
  const parentId = product.parentId?.trim() || parent?.id
  const parentName =
    product.parentProductName?.trim() ||
    parent?.productName?.trim() ||
    product.parentProductCode?.trim() ||
    parent?.productCode?.trim() ||
    t('products.common.unnamed')

  const galleryImages = [
    ...(coverImage ? [{ src: coverImage, isCover: true }] : []),
    ...(otherImages ?? []).filter((src): src is string => Boolean(src?.trim())).map((src) => ({ src, isCover: false }))
  ]
  const safeImageIndex = Math.min(activeImageIndex, galleryImages.length - 1)

  const salePrice = formatPrice(product.priceWithVatRaw ?? product.priceRaw)
  const availableForSaleDisplay = formatQuantity(
    product.sellableQuantity == null ? null : String(product.sellableQuantity)
  )
  const currentPriceValue = parseNumber(product.priceWithVatRaw ?? product.priceRaw)
  const oldPriceValue = parseNumber(product.oldPriceRaw)
  const hasDiscount = currentPriceValue !== null && oldPriceValue !== null && oldPriceValue > currentPriceValue
  const discountPct = hasDiscount ? Math.round((1 - currentPriceValue! / oldPriceValue!) * 100) : null

  const available = product.sellableQuantity ?? parseNumber(product.availableForSaleRaw)
  const stockStatusText = product.stockStatus?.trim()
  const isInStock = available !== null ? available > 0 : stockStatusText?.toLowerCase().includes('còn hàng') === true
  const statusText = stockStatusText || t(isInStock ? 'products.detail.inStock' : 'products.detail.outOfStock')
  const saleStatusText = t(
    product.isActive ? 'products.detail.comboSpecification.published' : 'products.detail.comboSpecification.unpublished'
  )
  const websiteUrl = slug?.trim()?.startsWith('http') ? slug.trim() : null

  const basicInfoRows = buildRows(BASIC_INFO_FIELDS, product)
  const pricingOverviewRows = buildRows(PRICING_OVERVIEW_FIELDS, product)
  const attributeRows = buildRows(ATTRIBUTE_OVERVIEW_FIELDS, product)
  const pricingRows = buildRows(PRICING_FIELDS, product)
  const inventoryRows = buildRows(INVENTORY_FIELDS, product)

  const rawTab = searchParams.get('tab')
  const isComboSpecificationTab = rawTab === 'quantity'
  const isValidTab =
    TAB_VALUES.includes(rawTab as (typeof TAB_VALUES)[number]) &&
    (rawTab !== 'variants' || variants.length > 0) &&
    (!isComboSpecificationTab || canManageComboSpecification)
  const currentTab = isValidTab ? rawTab! : 'overview'

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

  const handleUpdateComboPublication = async (publish: boolean) => {
    if (!publicationComboId || isUpdatingComboPublication || publish === isComboPublished) return

    await updateComboPublication({ comboId: publicationComboId, publish })
  }

  const ensureComboUnpublished = async () => {
    if (!isComboPublished) return true
    if (!publicationComboId || isUpdatingComboPublication) return false

    try {
      await updateComboPublication({ comboId: publicationComboId, publish: false })
      return true
    } catch {
      return false
    }
  }

  const TABS = [
    { value: 'overview', label: t('products.detail.tab.overview') },
    { value: 'specifications', label: t('products.detail.tab.specifications') },
    { value: 'pricing', label: t('products.detail.tab.pricing') },
    { value: 'inventory', label: t('products.detail.tab.inventory') },
    ...(canManageComboSpecification ? [{ value: 'quantity', label: t('products.detail.tab.quantity') }] : []),
    ...(variants.length > 0 ? [{ value: 'variants', label: t('products.detail.variants.title') }] : [])
  ]

  return (
    <div className='absolute inset-0 overflow-y-auto bg-muted/30'>
      <Tabs value={currentTab} onValueChange={handleTabChange} className='flex flex-col'>
        {/* Dashboard header */}
        <div className='space-y-5 px-4 pt-6 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <nav className='flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground'>
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products`}
              className='shrink-0 whitespace-nowrap transition-colors hover:text-foreground'
            >
              {t('products.list.title')}
            </Link>

            {parentId && (
              <>
                <ChevronRightIcon className='hidden size-3.5 shrink-0 sm:block' />
                <Link
                  to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${parentId}`}
                  className='hidden max-w-48 shrink truncate whitespace-nowrap transition-colors hover:text-foreground sm:block'
                >
                  {parentName}
                </Link>
              </>
            )}

            <ChevronRightIcon className='size-3.5 shrink-0' />
            <span className='min-w-0 truncate whitespace-nowrap font-medium text-foreground'>{displayName}</span>
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
                    isInStock
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : ''
                  )}
                >
                  <span
                    className={cn('size-1.5 rounded-full', isInStock ? 'bg-emerald-500' : 'bg-muted-foreground/50')}
                  />
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
              <div className='flex items-center gap-2'>
                <span className='whitespace-nowrap text-sm font-medium text-muted-foreground'>
                  {t('products.detail.comboSpecification.publicationStatus')}:
                </span>
                <Select
                  value={isComboPublished ? 'published' : 'unpublished'}
                  onValueChange={(value) => void handleUpdateComboPublication(value === 'published')}
                  disabled={isUpdatingComboPublication}
                >
                  <SelectTrigger
                    className={cn(
                      'h-9 min-w-36 gap-2 rounded-lg px-3 font-semibold shadow-sm transition-colors',
                      isComboPublished
                        ? cn(
                            primaryButtonEffectClasses,
                            'border-primary bg-none! ring-primary! [&_svg]:text-primary-foreground!'
                          )
                        : 'border-input bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    {isComboPublished && <ShoppingCartIcon className='size-4 shrink-0' />}
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align='end'>
                    <SelectItem value='published'>{t('products.detail.comboSpecification.published')}</SelectItem>
                    <SelectItem value='unpublished'>{t('products.detail.comboSpecification.unpublished')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant='outline' size='sm' onClick={handleCopyLink}>
                {linkCopied ? <CheckIcon className='size-3.5 text-emerald-500' /> : <Link2Icon className='size-3.5' />}
                {linkCopied ? t('products.detail.copied') : t('products.detail.share')}
              </Button>
            </div>
          </div>

          {/* Parent product notice — this product is a variant/child of another */}
          {parentId && (
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${parentId}`}
              className='group flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-2 transition-colors hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:hover:bg-blue-950/60'
            >
              <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'>
                <GitBranchIcon className='size-4' />
              </span>

              <div className='min-w-0 flex-1'>
                <p className='text-sm font-bold text-blue-900 dark:text-blue-200'>
                  {t('products.detail.parent.title')}
                </p>
                <p className='truncate text-xs text-blue-700/80 dark:text-blue-300/80'>
                  {t('products.detail.parent.description', { name: parentName })}
                </p>
              </div>

              <Button size='sm'>
                <p>{t('products.detail.parent.view')}</p>
                <ChevronRightIcon />
              </Button>
            </Link>
          )}

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
              value={availableForSaleDisplay ?? '-'}
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
              value={saleStatusText}
              icon={<CircleDotIcon className='size-4 text-white' />}
              color={product.isActive ? 'emerald' : 'slate'}
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
        <div className='w-full px-4 pt-2 pb-6 sm:px-6 lg:px-8'>
          {/* Overview */}
          <TabsContent value='overview' className='mt-0 space-y-8'>
            <DetailSection
              title={t('products.detail.section.basicInfo')}
              description={t('products.detail.sectionDesc.basicInfo')}
            >
              <DetailRows rows={basicInfoRows} t={t} />
            </DetailSection>

            <DetailSection
              title={t('products.detail.description.title')}
              description={t('products.detail.description.subtitle')}
              action={
                <Button variant='outline' size='sm' onClick={() => setDescriptionDialogOpen(true)}>
                  {t('products.detail.description.edit')}
                </Button>
              }
            >
              <div className='min-h-24 rounded-lg border bg-background p-4'>
                {description?.trim() ? (
                  <SanitizedHtml html={description} className='max-w-none overflow-visible' />
                ) : (
                  <p className='text-sm text-muted-foreground'>{t('products.detail.description.empty')}</p>
                )}
              </div>
            </DetailSection>

            <DetailSection
              title={t('products.detail.section.pricing')}
              description={t('products.detail.sectionDesc.pricing')}
            >
              <DetailRows rows={pricingOverviewRows} t={t} />
            </DetailSection>

            <DetailSection
              title={t('products.detail.section.images')}
              description={t('products.detail.sectionDesc.images')}
              action={
                galleryImages.length > 0 ? (
                  <Badge variant='secondary' className='font-normal'>
                    {galleryImages.length}
                  </Badge>
                ) : undefined
              }
            >
              {galleryImages.length > 0 ? (
                <div className='flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden'>
                  {galleryImages.map((image, index) => (
                    <button
                      key={image.src + index}
                      type='button'
                      onClick={() => {
                        setActiveImageIndex(index)
                        setLightboxOpen(true)
                      }}
                      className='group relative size-60 shrink-0 overflow-hidden rounded-lg border bg-muted/30'
                      aria-label={t('products.detail.viewImage')}
                    >
                      <img src={image.src} alt={displayName} className='size-full object-cover' />
                      <span className='absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100'>
                        <ZoomInIcon className='size-6 text-white' />
                      </span>
                      {image.isCover && (
                        <span className='absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm'>
                          <StarIcon className='size-3 fill-current' />
                          {t('products.detail.gallery.cover')}
                        </span>
                      )}
                      {image.isCover && discountPct !== null && (
                        <span className='absolute right-2 top-2 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm'>
                          -{discountPct}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className='flex size-60 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30 text-muted-foreground/50'>
                  <ImageIcon className='size-16' />
                  <span className='text-xs'>{t('products.common.noData')}</span>
                </div>
              )}
            </DetailSection>

            {attributeRows.length > 0 && (
              <DetailSection
                title={t('products.detail.section.attributes')}
                description={t('products.detail.sectionDesc.attributes')}
              >
                <DetailRows rows={attributeRows} t={t} />
              </DetailSection>
            )}

            {/* Category membership editor */}
            <ProductCategoriesEditor product={product} />
          </TabsContent>

          {/* Specifications */}
          <TabsContent value='specifications' className='mt-0 space-y-8'>
            {SPEC_GROUPS.map((group) => {
              const rows = buildRows(group.fields, product)
              if (rows.length === 0) return null
              return (
                <DetailSection
                  key={group.section}
                  title={t(group.label)}
                  description={t(`products.detail.sectionDesc.${group.section}`)}
                >
                  <DetailRows rows={rows} t={t} />
                </DetailSection>
              )
            })}
          </TabsContent>

          {/* Pricing */}
          <TabsContent value='pricing' className='mt-0'>
            <DetailSection
              title={t('products.detail.section.pricing')}
              description={t('products.detail.sectionDesc.pricing')}
            >
              <DetailRows rows={pricingRows} t={t} />
            </DetailSection>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value='inventory' className='mt-0'>
            <DetailSection
              title={t('products.detail.section.inventory')}
              description={t('products.detail.sectionDesc.inventory')}
            >
              <DetailRows rows={inventoryRows} t={t} />
            </DetailSection>
          </TabsContent>

          {canManageComboSpecification && (
            <TabsContent value='quantity' className='mt-0'>
              <DetailSection
                title={t('products.detail.comboSpecification.title')}
                description={t('products.detail.comboSpecification.description')}
              >
                <ComboSpecification
                  key={`${id}-${product.factor ?? 'unconfigured'}`}
                  productId={id ?? ''}
                  comboId={comboId}
                  factor={product.factor}
                  sellableQuantity={product.sellableQuantity}
                  stockStatus={product.stockStatus}
                  canEditFactor={canEditFactor}
                  canManageMaterials={canManageComboMaterials}
                  isUpdatingPublication={isUpdatingComboPublication}
                  onEnsureUnpublished={ensureComboUnpublished}
                  materials={comboSpecification?.materials ?? []}
                  isLoading={isGettingComboSpecification}
                  isError={isComboSpecificationError}
                  t={t}
                />
              </DetailSection>
            </TabsContent>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <TabsContent value='variants' className='mt-0'>
              <DetailSection
                title={t('products.detail.variants.title')}
                description={t('products.detail.sectionDesc.variants')}
                action={
                  <Badge variant='secondary' className='font-normal'>
                    {variants.length}
                  </Badge>
                }
              >
                <div className='overflow-x-auto rounded-lg border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-14' />
                        <TableHead>{t('products.column.product')}</TableHead>
                        <TableHead>{t('products.detail.variants.options')}</TableHead>
                        <TableHead className='text-right'>{t('products.field.price')}</TableHead>
                        <TableHead className='text-right'>{t('products.field.availableForSale')}</TableHead>
                        <TableHead>{t('products.column.status')}</TableHead>
                        <TableHead className='text-center'>{t('products.detail.comboSpecification.factor')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <VariantRow key={variant.id} variant={variant} parentId={id ?? ''} t={t} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DetailSection>
            </TabsContent>
          )}
        </div>
      </Tabs>

      {descriptionDialogOpen && (
        <ProductDescriptionDialog
          productId={id ?? ''}
          description={description ?? ''}
          open
          onOpenChange={setDescriptionDialogOpen}
        />
      )}

      <ImageLightbox
        slides={galleryImages.map((image) => ({ src: image.src, alt: displayName }))}
        index={lightboxOpen ? safeImageIndex : null}
        onIndexChange={(index) => (index === null ? setLightboxOpen(false) : setActiveImageIndex(index))}
      />
    </div>
  )
}
