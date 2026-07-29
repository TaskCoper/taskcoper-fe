import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/shared/utils'
import { LocateFixedIcon, MapPinIcon } from 'lucide-react'
import { lazy, Suspense, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useReverseGeocode } from '../../../hooks/use-reverse-geocode'

const AddressMapPicker = lazy(() => import('./address-map-picker'))

export interface ResolvedMapAddress {
  latitude: number
  longitude: number
  mapId: string
  addressLine: string
  ward: string
  city: string
}

// How far the pin may be dragged from the address the user typed. Enough to
// fine-tune the exact building, not enough to land in another area.
const MAX_PIN_DISTANCE_METERS = 500

interface AddressMapFieldProps {
  latitude: number
  longitude: number
  onResolve: (result: ResolvedMapAddress) => void
  hint: string
  useLocationLabel: string
  resolvingLabel: string
  locationErrorLabel: string
  // Coordinate the typed address resolved to; the pin can't stray past
  // `MAX_PIN_DISTANCE_METERS` from it. Omit to allow free placement.
  anchorLatitude?: number
  anchorLongitude?: number
  tooFarLabel?: string
  className?: string
  disabled?: boolean
}

export default function AddressMapField({
  latitude,
  longitude,
  onResolve,
  hint,
  useLocationLabel,
  resolvingLabel,
  locationErrorLabel,
  anchorLatitude,
  anchorLongitude,
  tooFarLabel,
  className,
  disabled
}: AddressMapFieldProps) {
  const { reverseGeocode, isReverseGeocoding } = useReverseGeocode()
  const [isLocating, setIsLocating] = useState(false)

  const handleReject = useCallback(() => {
    if (tooFarLabel) toast.error(tooFarLabel)
  }, [tooFarLabel])

  const handlePick = useCallback(
    async ({ latitude: lat, longitude: lng }: { latitude: number; longitude: number }) => {
      try {
        const result = await reverseGeocode({ lat, lng })
        onResolve(result)
      } catch {
        // Keep the picked coordinates even if reverse geocoding fails.
        onResolve({ latitude: lat, longitude: lng, mapId: '', addressLine: '', ward: '', city: '' })
      }
    },
    [onResolve, reverseGeocode]
  )

  const handleUseLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error(locationErrorLabel)
      return
    }
    // Geolocation only resolves in a secure context: https:// or localhost.
    // Over plain http (e.g. a LAN IP dev server opened on a phone) the browser
    // blocks it outright, so surface that as the reason instead of a timeout.
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast.error(locationErrorLabel, { description: 'Requires HTTPS or localhost.' })
      return
    }
    setIsLocating(true)

    const locate = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)
          void handlePick({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        },
        (error) => {
          // High-accuracy asks for a GPS fix first; desktops/laptops without a GPS
          // chip often fail that outright with POSITION_UNAVAILABLE instead of
          // falling back to the coarser network/Wi-Fi provider. Retry once at low
          // accuracy before surfacing an error.
          if (highAccuracy && error.code === error.POSITION_UNAVAILABLE) {
            locate(false)
            return
          }
          setIsLocating(false)
          // Report the actual cause so permission-denied vs. unavailable vs.
          // timeout is distinguishable (on macOS, "unavailable" usually means
          // Location Services is off for the browser in System Settings).
          console.warn('[geolocation] failed', { code: error.code, message: error.message })
          // POSITION_UNAVAILABLE means the OS provider couldn't get a fix — the
          // browser message is usually empty/cryptic, so give an actionable hint.
          const description =
            error.code === error.POSITION_UNAVAILABLE
              ? 'Location unavailable — check Location Services and Wi‑Fi are on.'
              : error.message || undefined
          toast.error(locationErrorLabel, { description })
        },
        // Allow a recent cached fix and a longer window — high-accuracy on a
        // desktop can be slow, and a coarse position is fine as a starting pin.
        { enableHighAccuracy: highAccuracy, timeout: 15000, maximumAge: 60000 }
      )
    }

    locate(true)
  }, [handlePick, locationErrorLabel])

  return (
    <div className={cn('space-y-2', className)}>
      <div className='flex items-center justify-between gap-2'>
        <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
          <MapPinIcon className='size-3.5 shrink-0' />
          {hint}
        </p>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-7 shrink-0 px-2 text-xs'
          onClick={handleUseLocation}
          disabled={disabled || isLocating}
        >
          {isLocating ? <Spinner className='size-3.5' /> : <LocateFixedIcon className='size-3.5' />}
          {useLocationLabel}
        </Button>
      </div>

      <div className='relative'>
        <Suspense fallback={<Skeleton className='h-56 w-full rounded-xl' />}>
          <AddressMapPicker
            latitude={latitude}
            longitude={longitude}
            onPick={handlePick}
            anchorLatitude={anchorLatitude}
            anchorLongitude={anchorLongitude}
            maxDistanceMeters={MAX_PIN_DISTANCE_METERS}
            onReject={handleReject}
          />
        </Suspense>
        {isReverseGeocoding ? (
          <div className='absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-background/85 py-1.5 text-xs text-muted-foreground backdrop-blur-sm'>
            <Spinner className='size-3.5' />
            {resolvingLabel}
          </div>
        ) : null}
      </div>
    </div>
  )
}
