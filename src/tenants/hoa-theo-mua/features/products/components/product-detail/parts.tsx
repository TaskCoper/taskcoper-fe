import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/components/ui/badge'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { TableCell, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { PackageIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { useDebounce } from 'use-debounce'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { useUpdateChildQuantity } from '../../combos/hooks/use-update-child-quantity'
import { createComboFactorSchema, type ComboFactorFormValues } from '../../combos/validations'
import { useGetProduct } from '../../hooks/use-get-product'
import type { Product } from '../../types'
import { formatPrice, formatQuantity } from '../../utils'
import { isActiveStatus, type SpecRow } from './fields'

export function DetailSection({
  title,
  description,
  action,
  children
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className='space-y-3'>
      <div className='flex items-start justify-between gap-4'>
        <div className='-space-y-1'>
          <h2 className='text-lg font-bold'>{title}</h2>
          {description && <p className='text-sm text-muted-foreground'>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Simple zebra-striped key/value rows inside a bordered container. */
export function DetailRows({ rows, t }: { rows: SpecRow[]; t: TenantT }) {
  if (rows.length === 0) {
    return (
      <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
        {t('products.common.noData')}
      </div>
    )
  }

  return (
    <div className='divide-y overflow-hidden rounded-lg border'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='grid grid-cols-1 gap-0.5 px-3 py-2 text-sm sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-baseline sm:gap-4'
        >
          <span className='text-muted-foreground'>{t(row.label)}</span>
          <span className='wrap-break-word font-medium'>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function VariantRow({ variant, parentId, t }: { variant: Product; parentId: string; t: TenantT }) {
  const { product: variantDetail, isGettingProduct: isGettingVariantDetail } = useGetProduct({ id: variant.id })
  const name = variant.productName?.trim() || t('products.common.unnamed')
  const price = formatPrice(variant.priceWithVatRaw ?? variant.priceRaw)
  const available = variantDetail?.sellableQuantity ?? null
  const sellableQuan = formatQuantity(available == null ? null : String(available))
  const outOfStock = available !== null && available <= 0
  const active = isActiveStatus(variant.status) && !outOfStock
  const statusText = outOfStock
    ? t('products.detail.outOfStock')
    : variant.status?.trim() || t('products.detail.inStock')

  return (
    <TableRow>
      <TableCell className='w-14'>
        <span className='flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
          {variant.coverImage ? (
            <img src={variant.coverImage} alt={name} className='size-full object-cover' />
          ) : (
            <PackageIcon className='size-5 text-muted-foreground/50' />
          )}
        </span>
      </TableCell>
      <TableCell className='max-w-56'>
        <Link
          to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${variant.id}`}
          className='block truncate font-medium hover:underline'
        >
          {name}
        </Link>
        {variant.productCode?.trim() && (
          <p className='truncate font-mono text-xs text-muted-foreground'>{variant.productCode}</p>
        )}
      </TableCell>
      <TableCell>
        <div className='flex flex-wrap gap-1.5'>
          {variant.color?.trim() && (
            <Badge variant='secondary' className='font-normal'>
              {variant.color}
            </Badge>
          )}
          {variant.size?.trim() && (
            <Badge variant='secondary' className='font-normal'>
              {variant.size}
            </Badge>
          )}
          {!variant.color?.trim() && !variant.size?.trim() && <span className='text-muted-foreground'>-</span>}
        </div>
      </TableCell>

      <TableCell className='whitespace-nowrap text-right font-medium'>
        {price ?? t('products.detail.priceUnknown')}
      </TableCell>
      <TableCell className='whitespace-nowrap text-right tabular-nums'>
        {isGettingVariantDetail ? <Skeleton className='ml-auto h-5 w-12' /> : (sellableQuan ?? '-')}
      </TableCell>
      <TableCell>
        <Badge
          variant='secondary'
          className={cn(
            'gap-1.5 whitespace-nowrap font-medium',
            active
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
              : ''
          )}
        >
          <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-muted-foreground/50')} />
          {statusText}
        </Badge>
      </TableCell>
      <TableCell className='text-center'>
        {isGettingVariantDetail ? (
          <Skeleton className='mx-auto h-9 w-36' />
        ) : (
          <VariantFactorEditor
            key={`${variant.id}-${variantDetail?.factor ?? 'unconfigured'}`}
            productId={variant.id}
            parentId={parentId}
            initialFactor={variantDetail?.factor ?? null}
            t={t}
          />
        )}
      </TableCell>
    </TableRow>
  )
}

function VariantFactorEditor({
  productId,
  parentId,
  initialFactor,
  t
}: {
  productId: string
  parentId: string
  initialFactor: number | null
  t: TenantT
}) {
  const factorSchema = useMemo(() => createComboFactorSchema(t), [t])
  const form = useForm<ComboFactorFormValues>({
    resolver: zodResolver(factorSchema),
    defaultValues: { factor: initialFactor },
    mode: 'onChange'
  })
  const { updateChildQuantity, isUpdatingChildQuantity } = useUpdateChildQuantity()
  const factor = useWatch({ control: form.control, name: 'factor' })
  const [debouncedFactor] = useDebounce(factor, 500)
  const lastAttemptedFactor = useRef<number | null>(initialFactor)

  useEffect(() => {
    if (isUpdatingChildQuantity || Object.is(debouncedFactor, lastAttemptedFactor.current)) return

    const updateFactor = async () => {
      const isValid = await form.trigger('factor')
      if (!isValid || !Object.is(form.getValues('factor'), debouncedFactor)) return

      lastAttemptedFactor.current = debouncedFactor
      try {
        await updateChildQuantity({ productId, parentId, factor: debouncedFactor })
      } catch {
        // The mutation displays the API error. Wait for another user change before retrying.
      }
    }

    void updateFactor()
  }, [debouncedFactor, form, isUpdatingChildQuantity, parentId, productId, updateChildQuantity])

  return (
    <div className='mx-auto w-32'>
      <Controller
        control={form.control}
        name='factor'
        render={({ field, fieldState }) => (
          <div>
            <Input
              ref={field.ref}
              name={field.name}
              type='number'
              min={0}
              step='any'
              value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(event.target.value === '' ? null : event.target.valueAsNumber)}
              disabled={isUpdatingChildQuantity}
            />
            <FieldError className='mt-1 text-xs leading-tight' errors={[fieldState.error]} />
            {!fieldState.error && isUpdatingChildQuantity && (
              <p className='mt-1 flex items-center justify-center gap-1 text-xs leading-tight text-muted-foreground'>
                <Spinner className='size-3' />
                {t('products.detail.comboSpecification.updatingFactor')}
              </p>
            )}
            {!fieldState.error && !isUpdatingChildQuantity && field.value == null && (
              <p className='mt-1 text-xs leading-tight text-muted-foreground'>
                {t('products.detail.comboSpecification.factorPlaceholder')}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className='absolute inset-0 overflow-y-auto bg-muted/30'>
      <div className='space-y-5 px-4 pt-6 sm:px-6 lg:px-8'>
        <Skeleton className='h-5 w-72' />
        <div className='space-y-2'>
          <Skeleton className='h-8 w-80' />
          <Skeleton className='h-4 w-56' />
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-20.5 w-full rounded-2xl' />
          ))}
        </div>
        <div className='flex gap-2 border-b'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-10 w-28' />
          ))}
        </div>
      </div>
      <div className='grid w-full gap-6 px-4 py-6 sm:px-6 lg:px-8'>
        <Skeleton className='h-56 w-full rounded-xl' />
        <div className='space-y-4'>
          <Skeleton className='h-40 w-full rounded-xl' />
          <Skeleton className='h-48 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
}
