import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Code2Icon, ExternalLinkIcon, ImageIcon, LayoutListIcon, Plus, Trash2, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useGetProductsByIds } from '../../products/hooks/use-get-products-by-ids'
import {
  emptySignatureLandingGroup,
  groupSignatureLandings,
  parseSignatureLandingMap,
  stringifySignatureLandings,
  type SignatureLandingGroup,
  type SignatureProductRef
} from '../signature-landing-palette'
import SignatureProductPicker from './signature-product-picker'

interface SignatureLandingEditorProps {
  value: unknown
  onChange: (next: string) => void
}

const toRawString = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2)

export default function SignatureLandingEditor({ value, onChange }: SignatureLandingEditorProps) {
  const { t } = useTenantTranslation()

  const [groups, setGroups] = useState<SignatureLandingGroup[]>(() =>
    groupSignatureLandings(parseSignatureLandingMap(value))
  )
  const [isRawMode, setIsRawMode] = useState(false)
  const [rawDraft, setRawDraft] = useState('')
  const [rawError, setRawError] = useState(false)

  const incoming = toRawString(value)
  const [syncedValue, setSyncedValue] = useState(incoming)
  if (incoming !== syncedValue) {
    setSyncedValue(incoming)
    setGroups(groupSignatureLandings(parseSignatureLandingMap(value)))
    setRawError(false)
  }

  const commit = (next: SignatureLandingGroup[]) => {
    setGroups(next)
    const serialized = stringifySignatureLandings(next)
    setSyncedValue(serialized)
    onChange(serialized)
  }

  const allProductIds = useMemo(() => groups.flatMap((group) => group.productIds), [groups])
  const { productsById, isGettingProductsByIds } = useGetProductsByIds(allProductIds)

  const assignedIds = useMemo(() => new Set(allProductIds), [allProductIds])
  const totalProducts = allProductIds.length

  const updateGroup = (index: number, patch: Partial<SignatureLandingGroup>) => {
    commit(groups.map((group, i) => (i === index ? { ...group, ...patch } : group)))
  }

  const toggleProduct = (index: number, product: SignatureProductRef) => {
    const target = groups[index]
    if (target.productIds.includes(product.id)) {
      updateGroup(index, { productIds: target.productIds.filter((id) => id !== product.id) })
      return
    }

    // A product maps to exactly one URL, so picking it here takes it away from whichever group had it.
    commit(
      groups.map((group, i) =>
        i === index
          ? { ...group, productIds: [...group.productIds, product.id] }
          : { ...group, productIds: group.productIds.filter((id) => id !== product.id) }
      )
    )
  }

  const enterRawMode = () => {
    setRawDraft(stringifySignatureLandings(groups))
    setRawError(false)
    setIsRawMode(true)
  }

  const handleRawChange = (next: string) => {
    setRawDraft(next)
    let parsed: unknown
    try {
      parsed = JSON.parse(next)
    } catch {
      setRawError(true)
      return
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setRawError(true)
      return
    }

    setRawError(false)
    commit(groupSignatureLandings(parseSignatureLandingMap(parsed)))
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <FieldLabel>{t('configsPage.signatureLanding.title')}</FieldLabel>
          <p className='text-xs text-muted-foreground'>
            {t('configsPage.signatureLanding.subtitle', { products: totalProducts, pages: groups.length })}
          </p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='shrink-0 text-xs text-muted-foreground'
          onClick={() => (isRawMode ? setIsRawMode(false) : enterRawMode())}
        >
          {isRawMode ? (
            <LayoutListIcon className='size-3.5' data-icon='inline-start' />
          ) : (
            <Code2Icon className='size-3.5' data-icon='inline-start' />
          )}
          {isRawMode ? t('configsPage.signatureLanding.visualMode') : t('configsPage.signatureLanding.rawMode')}
        </Button>
      </div>

      {isRawMode ? (
        <div className='space-y-1'>
          <Textarea
            rows={12}
            value={rawDraft}
            onChange={(event) => handleRawChange(event.target.value)}
            className='resize-y font-mono text-xs'
            aria-invalid={rawError}
            spellCheck={false}
          />
          <p className={cn('text-xs', rawError ? 'text-destructive' : 'text-muted-foreground')}>
            {rawError ? t('configsPage.signatureLanding.invalidJson') : t('configsPage.signatureLanding.rawHint')}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {groups.length === 0 ? (
            <div className='rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground'>
              {t('configsPage.signatureLanding.empty')}
            </div>
          ) : (
            groups.map((group, index) => (
              <LandingGroupCard
                key={group.uid}
                group={group}
                index={index}
                productsById={productsById}
                isResolvingProducts={isGettingProductsByIds}
                assignedElsewhere={new Set([...assignedIds].filter((id) => !group.productIds.includes(id)))}
                onUrlChange={(url) => updateGroup(index, { url })}
                onRemove={() => commit(groups.filter((_, i) => i !== index))}
                onToggleProduct={(product) => toggleProduct(index, product)}
                onRemoveProduct={(productId) =>
                  updateGroup(index, { productIds: group.productIds.filter((id) => id !== productId) })
                }
              />
            ))
          )}

          <Button
            type='button'
            size='sm'
            className='w-full border-dashed'
            onClick={() => commit([...groups, emptySignatureLandingGroup()])}
          >
            <Plus className='size-3.5' data-icon='inline-start' />
            {t('configsPage.signatureLanding.addGroup')}
          </Button>
        </div>
      )}
    </div>
  )
}

interface LandingGroupCardProps {
  group: SignatureLandingGroup
  index: number
  productsById: Record<string, SignatureProductRef>
  isResolvingProducts: boolean
  assignedElsewhere: Set<string>
  onUrlChange: (url: string) => void
  onRemove: () => void
  onToggleProduct: (product: SignatureProductRef) => void
  onRemoveProduct: (productId: string) => void
}

function LandingGroupCard({
  group,
  index,
  productsById,
  isResolvingProducts,
  assignedElsewhere,
  onUrlChange,
  onRemove,
  onToggleProduct,
  onRemoveProduct
}: LandingGroupCardProps) {
  const { t } = useTenantTranslation()
  const trimmedUrl = group.url.trim()
  const isDroppedOnSave = !trimmedUrl || group.productIds.length === 0

  return (
    <div className='space-y-3 rounded-xl border bg-muted/30 p-3'>
      <div className='flex items-center gap-2'>
        <Badge variant='outline' className='size-6 shrink-0 justify-center rounded-full bg-background p-0 text-xs'>
          {index + 1}
        </Badge>
        <Input
          value={group.url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder={t('configsPage.signatureLanding.urlPlaceholder')}
          className='flex-1 bg-background font-mono text-xs h-7.5'
          spellCheck={false}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          className='shrink-0 text-muted-foreground'
          disabled={!trimmedUrl}
          asChild={!!trimmedUrl}
          aria-label={t('configsPage.signatureLanding.openUrl')}
          title={t('configsPage.signatureLanding.openUrl')}
        >
          {trimmedUrl ? (
            <a href={trimmedUrl} target='_blank' rel='noreferrer'>
              <ExternalLinkIcon className='size-3.5' />
            </a>
          ) : (
            <ExternalLinkIcon className='size-3.5' />
          )}
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          className='shrink-0 text-muted-foreground hover:text-destructive'
          onClick={onRemove}
          aria-label={t('configsPage.signatureLanding.removeGroup')}
          title={t('configsPage.signatureLanding.removeGroup')}
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>

      <div className='flex flex-wrap items-center gap-1.5'>
        {group.productIds.map((productId) => (
          <ProductChip
            key={productId}
            productId={productId}
            product={productsById[productId]}
            isResolving={isResolvingProducts}
            onRemove={() => onRemoveProduct(productId)}
          />
        ))}

        <SignatureProductPicker
          selectedIds={group.productIds}
          assignedElsewhere={assignedElsewhere}
          onToggle={onToggleProduct}
        />
      </div>

      {isDroppedOnSave && (
        <p className='text-xs text-muted-foreground'>
          {!trimmedUrl
            ? t('configsPage.signatureLanding.missingUrl')
            : t('configsPage.signatureLanding.missingProducts')}
        </p>
      )}
    </div>
  )
}

function ProductChip({
  productId,
  product,
  isResolving,
  onRemove
}: {
  productId: string
  product?: SignatureProductRef
  isResolving: boolean
  onRemove: () => void
}) {
  const { t } = useTenantTranslation()

  const isUnresolved = !product && !isResolving
  const label =
    product?.productName ??
    (isResolving ? `${productId.slice(0, 8)}…` : t('configsPage.signatureLanding.unknownProduct'))

  return (
    <span
      className={cn(
        'flex items-center gap-1 rounded-full border bg-background p-0.5',
        !product && 'border-dashed text-muted-foreground'
      )}
      title={
        isUnresolved
          ? `${t('configsPage.signatureLanding.unknownProduct')} · ${productId}`
          : product?.productCode
            ? `${product.productCode} · ${productId}`
            : productId
      }
    >
      <span className='size-5 shrink-0 overflow-hidden rounded-full border bg-muted'>
        {product?.coverImage ? (
          <img src={product.coverImage} alt='' className='size-full object-cover' />
        ) : (
          <span className='flex size-full items-center justify-center text-muted-foreground'>
            <ImageIcon className='size-2.5' />
          </span>
        )}
      </span>
      <span className='max-w-56 truncate text-xs'>{label}</span>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='size-5 shrink-0 rounded-full text-muted-foreground hover:text-destructive'
        onClick={onRemove}
        aria-label={t('configsPage.signatureLanding.removeProduct')}
      >
        <XIcon className='size-3' />
      </Button>
    </span>
  )
}
