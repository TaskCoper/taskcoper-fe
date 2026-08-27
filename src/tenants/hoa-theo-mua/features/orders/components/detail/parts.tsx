import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, CopyIcon, ExternalLinkIcon, MapPinIcon, MapPinnedIcon, PhoneIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export interface DetailRow {
  /** i18n key resolved by `DetailRows`. */
  label: string
  value: ReactNode
  mono?: boolean
}

export function DetailSection({
  title,
  description,
  action,
  className,
  children
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn('space-y-3', className)}>
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

/** Key/value rows inside a bordered container - mirrors the product detail layout. */
export function DetailRows({ rows, t }: { rows: DetailRow[]; t: TenantT }) {
  if (rows.length === 0) {
    return (
      <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
        {t('systemOrders.common.noData')}
      </div>
    )
  }

  return (
    <div className='divide-y overflow-hidden rounded-lg border bg-card'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='grid grid-cols-1 gap-0.5 px-3 py-2 text-sm sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-baseline sm:gap-4'
        >
          <span className='text-muted-foreground'>{t(row.label)}</span>
          <span className={cn('break-words font-medium', row.mono && 'font-mono')}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TrackingLink({ href, label, empty }: { href: string | null; label: string; empty: string }) {
  const url = href?.trim()
  if (!url) return <span className='font-normal text-muted-foreground'>{empty}</span>

  return (
    <a
      href={url}
      target='_blank'
      rel='noreferrer'
      className='inline-flex items-center gap-1 text-primary hover:underline'
    >
      {label}
      <ExternalLinkIcon className='size-3' />
    </a>
  )
}

function hasValidCoordinates(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  )
}

/**
 * Delivery panel: embedded Google Map beside the receiver contact and the written address.
 * Replaces the address rows that used to sit next to the map - everything lives in one card.
 */
export function DeliveryCard({
  latitude,
  longitude,
  address,
  shortAddress,
  ward,
  city,
  receiverName,
  receiverPhone
}: {
  latitude: number
  longitude: number
  address: string | null
  shortAddress: string | null
  ward?: number | null
  city?: number | null
  receiverName?: string | null
  receiverPhone?: string | null
}) {
  const { t, i18n } = useTenantTranslation()
  const [copied, setCopied] = useState(false)

  const hasMap = hasValidCoordinates(latitude, longitude)
  const query = `${latitude},${longitude}`
  const embedSrc = `https://maps.google.com/maps?q=${query}&z=16&hl=${i18n.language}&output=embed`
  const openSrc = `https://www.google.com/maps/search/?api=1&query=${query}`

  const primary = address?.trim() || shortAddress?.trim() || null
  const secondary =
    address?.trim() && shortAddress?.trim() && shortAddress.trim() !== address.trim() ? shortAddress.trim() : null

  const handleCopyAddress = async () => {
    if (!primary) return

    try {
      await navigator.clipboard.writeText(primary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable - silently ignore */
    }
  }

  return (
    // Container-adaptive: stacks (map on top, compact details) in a narrow column such as the
    // dashboard header, and splits into map + full details panel once the card gets wide enough.
    <div className='@container h-full overflow-hidden rounded-2xl border bg-card shadow-sm'>
      <div className='flex h-full flex-col @2xl:flex-row'>
        {/* Map */}
        <div className='relative min-h-40 flex-1 bg-muted/40 @2xl:min-h-80'>
          {hasMap ? (
            <iframe
              title={t('systemOrders.detail.mapTitle')}
              src={embedSrc}
              className='absolute inset-0 size-full border-0'
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          ) : (
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <span className='flex size-12 items-center justify-center rounded-2xl bg-background/70 shadow-sm'>
                <MapPinnedIcon className='size-6' />
              </span>
              <span className='text-sm'>{t('systemOrders.detail.noLocation')}</span>
            </div>
          )}
        </div>

        {/* Receiver + address */}
        <div className='flex shrink-0 flex-col gap-3 border-t p-3.5 @2xl:w-88 @2xl:gap-4 @2xl:border-l @2xl:border-t-0 @2xl:p-5'>
          {/* Receiver contact - only worth the space once the card is wide */}
          <div className='hidden space-y-1 @2xl:block'>
            <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {t('systemOrders.detail.deliverTo')}
            </p>
            <p className='text-base font-semibold leading-snug'>
              {receiverName?.trim() || t('systemOrders.common.noData')}
            </p>
            {receiverPhone?.trim() && (
              <a
                href={`tel:${receiverPhone.trim()}`}
                className='inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground'
              >
                <PhoneIcon className='size-3.5' />
                {receiverPhone.trim()}
              </a>
            )}
          </div>

          <div className='flex items-start gap-2.5 @2xl:rounded-xl @2xl:bg-muted/50 @2xl:p-3'>
            <MapPinIcon className='mt-0.5 size-4 shrink-0 text-primary' />
            <div className='min-w-0 space-y-0.5'>
              <p className='line-clamp-3 text-sm font-medium leading-snug @2xl:line-clamp-none'>
                {primary ?? t('systemOrders.common.noData')}
              </p>
              {secondary && (
                <p className='line-clamp-2 text-xs leading-snug text-muted-foreground @2xl:line-clamp-none'>
                  {secondary}
                </p>
              )}
            </div>
          </div>

          {(!!ward || !!city) && (
            <div className='hidden flex-wrap gap-1.5 @2xl:flex'>
              {!!ward && (
                <Badge variant='secondary' className='text-xs font-normal'>
                  {t('systemOrders.detail.ward')}: {ward}
                </Badge>
              )}
              {!!city && (
                <Badge variant='secondary' className='text-xs font-normal'>
                  {t('systemOrders.detail.city')}: {city}
                </Badge>
              )}
            </div>
          )}

          <div className='mt-auto flex gap-2 pt-1'>
            {hasMap && (
              <Button asChild size='sm' className='flex-1'>
                <a href={openSrc} target='_blank' rel='noreferrer'>
                  <ExternalLinkIcon className='size-3.5' />
                  {t('systemOrders.detail.openInMaps')}
                </a>
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              className={hasMap ? 'shrink-0' : 'flex-1'}
              onClick={handleCopyAddress}
              disabled={!primary}
              title={t('systemOrders.detail.copyAddress')}
            >
              {copied ? <CheckIcon className='size-3.5 text-emerald-500' /> : <CopyIcon className='size-3.5' />}
              <span className={hasMap ? 'sr-only @2xl:not-sr-only' : undefined}>
                {copied ? t('systemOrders.detail.copied') : t('systemOrders.detail.copyAddress')}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderDetailSkeleton() {
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
            <Skeleton key={i} className='h-[82px] w-full rounded-2xl' />
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
        <Skeleton className='h-48 w-full rounded-xl' />
      </div>
    </div>
  )
}
