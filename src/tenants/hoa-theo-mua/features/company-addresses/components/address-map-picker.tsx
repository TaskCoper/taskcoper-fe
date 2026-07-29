import { cn } from '@/shared/utils'
import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl'
import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css'
import { useCallback, useEffect, useRef } from 'react'

type MapInstance = InstanceType<typeof vietmapgl.Map>
type MarkerInstance = InstanceType<typeof vietmapgl.Marker>

// Fallback center when no coordinates are set yet: Ho Chi Minh City centre.
const DEFAULT_CENTER: [number, number] = [106.6297, 10.8231]
const DEFAULT_ZOOM = 15
const FALLBACK_ZOOM = 11

const STYLE_URL = `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${import.meta.env.VITE_VIETMAP_MAP_API_KEY}`

// maplibre aborts in-flight style/tile fetches when a map is torn down before
// it finishes loading (React StrictMode double-mount, or a fast dialog close).
// Those aborted fetches reject asynchronously with a benign AbortError that no
// one awaits, so it escapes as an unhandled rejection ("signal is aborted
// without reason") and trips the dev error overlay. Swallow just that case.
let abortRejectionSuppressorInstalled = false
const installAbortRejectionSuppressor = () => {
  if (abortRejectionSuppressorInstalled || typeof window === 'undefined') return
  abortRejectionSuppressorInstalled = true
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof DOMException && event.reason.name === 'AbortError') {
      event.preventDefault()
    }
  })
}

const isValidCoord = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  !(latitude === 0 && longitude === 0) &&
  Math.abs(latitude) <= 90 &&
  Math.abs(longitude) <= 180

// Great-circle distance in metres between two lat/lng points (haversine).
const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

const RADIUS_SOURCE_ID = 'pin-radius'
const RADIUS_FILL_LAYER_ID = 'pin-radius-fill'
const RADIUS_LINE_LAYER_ID = 'pin-radius-line'
const RADIUS_COLOR = '#e11d48'
const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] } as const

// A GeoJSON polygon approximating a circle of `radiusMeters` around a point.
// Drawn as a real polygon (not a pixel-radius circle layer) so it stays fixed
// to the ground and scales correctly with zoom.
const circlePolygon = (lng: number, lat: number, radiusMeters: number, points = 64) => {
  const latDelta = radiusMeters / 111_320
  const lngDelta = radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180))
  const coordinates: [number, number][] = []
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI
    coordinates.push([lng + lngDelta * Math.cos(theta), lat + latDelta * Math.sin(theta)])
  }
  return {
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [coordinates] },
    properties: {}
  }
}

interface AddressMapPickerProps {
  latitude: number
  longitude: number
  onPick: (coords: { latitude: number; longitude: number }) => void
  className?: string
  // Anchor the picked point is measured against (usually the coordinate the
  // typed address resolved to). A pick further than `maxDistanceMeters` from
  // this anchor is rejected and the marker snaps back.
  anchorLatitude?: number
  anchorLongitude?: number
  maxDistanceMeters?: number
  onReject?: (distanceMeters: number) => void
}

export default function AddressMapPicker({
  latitude,
  longitude,
  onPick,
  className,
  anchorLatitude,
  anchorLongitude,
  maxDistanceMeters,
  onReject
}: AddressMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const markerRef = useRef<MarkerInstance | null>(null)
  const markerAddedRef = useRef(false)
  const teardownTimerRef = useRef<number | null>(null)
  const onPickRef = useRef(onPick)
  const onRejectRef = useRef(onReject)
  // Tracks the coordinate this component last rendered, so external prop
  // updates recentre the map without echoing our own onPick emissions back.
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null)
  // The anchor + radius the map handlers (created once on mount) read from, so
  // the constraint stays current as props change without re-creating the map.
  const guardRef = useRef<{ latitude: number; longitude: number; max: number } | null>(null)
  // Set once the style has loaded and the radius source/layers are in place.
  const radiusReadyRef = useRef(false)

  // Redraws the radius circle from the current guard. Reads only refs, so it is
  // stable and safe to call from both the map 'load' handler and prop effects.
  const updateRadiusLayer = useCallback(() => {
    const map = mapRef.current
    if (!map || !radiusReadyRef.current) return
    const source = map.getSource(RADIUS_SOURCE_ID) as { setData?: (data: unknown) => void } | undefined
    if (!source?.setData) return
    const guard = guardRef.current
    source.setData(guard ? circlePolygon(guard.longitude, guard.latitude, guard.max) : EMPTY_FEATURE_COLLECTION)
  }, [])

  useEffect(() => {
    onPickRef.current = onPick
    onRejectRef.current = onReject
  }, [onPick, onReject])

  useEffect(() => {
    guardRef.current =
      isValidCoord(anchorLatitude ?? NaN, anchorLongitude ?? NaN) && (maxDistanceMeters ?? 0) > 0
        ? { latitude: anchorLatitude as number, longitude: anchorLongitude as number, max: maxDistanceMeters as number }
        : null
    updateRadiusLayer()
  }, [anchorLatitude, anchorLongitude, maxDistanceMeters, updateRadiusLayer])

  useEffect(() => {
    if (!containerRef.current) return
    installAbortRejectionSuppressor()

    // React StrictMode (dev) mounts → unmounts → remounts synchronously. Cancel
    // any teardown queued by that fake unmount so we keep the same map instead of
    // destroying it mid-load (which is what aborts the in-flight style fetch).
    if (teardownTimerRef.current !== null) {
      clearTimeout(teardownTimerRef.current)
      teardownTimerRef.current = null
    }

    if (!mapRef.current) {
      const hasCoord = isValidCoord(latitude, longitude)
      const center: [number, number] = hasCoord ? [longitude, latitude] : DEFAULT_CENTER

      const map = new vietmapgl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center,
        zoom: hasCoord ? DEFAULT_ZOOM : FALLBACK_ZOOM
      })
      mapRef.current = map

      map.addControl(new vietmapgl.NavigationControl(), 'top-right')

      // The allowed-radius circle lives below the marker. Added once the style
      // is ready; the guard effect fills in its geometry.
      map.on('load', () => {
        if (!map.getSource(RADIUS_SOURCE_ID)) {
          map.addSource(RADIUS_SOURCE_ID, { type: 'geojson', data: EMPTY_FEATURE_COLLECTION })
          map.addLayer({
            id: RADIUS_FILL_LAYER_ID,
            type: 'fill',
            source: RADIUS_SOURCE_ID,
            paint: { 'fill-color': RADIUS_COLOR, 'fill-opacity': 0.08 }
          })
          map.addLayer({
            id: RADIUS_LINE_LAYER_ID,
            type: 'line',
            source: RADIUS_SOURCE_ID,
            paint: { 'line-color': RADIUS_COLOR, 'line-opacity': 0.4, 'line-width': 1.5 }
          })
        }
        radiusReadyRef.current = true
        updateRadiusLayer()
      })

      const marker = new vietmapgl.Marker({ draggable: true, color: '#e11d48' })
      markerRef.current = marker
      if (hasCoord) {
        marker.setLngLat(center).addTo(map)
        markerAddedRef.current = true
        lastCoordRef.current = { latitude, longitude }
      }

      const showMarkerAt = (lng: number, lat: number) => {
        marker.setLngLat([lng, lat])
        if (!markerAddedRef.current) {
          marker.addTo(map)
          markerAddedRef.current = true
        }
      }

      const emit = (lng: number, lat: number) => {
        lastCoordRef.current = { latitude: lat, longitude: lng }
        onPickRef.current({ latitude: lat, longitude: lng })
      }

      // Returns true if the pick is within the allowed radius of the anchor.
      // When it isn't, the marker is snapped back to the last valid point.
      const isWithinRadius = (lng: number, lat: number) => {
        const guard = guardRef.current
        if (!guard) return true
        const dist = distanceMeters(guard.latitude, guard.longitude, lat, lng)
        if (dist <= guard.max) return true
        const fallback = lastCoordRef.current ?? { latitude: guard.latitude, longitude: guard.longitude }
        marker.setLngLat([fallback.longitude, fallback.latitude])
        map.easeTo({ center: [fallback.longitude, fallback.latitude] })
        onRejectRef.current?.(dist)
        return false
      }

      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat()
        if (!isWithinRadius(lng, lat)) return
        emit(lng, lat)
      })

      map.on('click', (event) => {
        const { lng, lat } = event.lngLat
        if (!isWithinRadius(lng, lat)) return
        showMarkerAt(lng, lat)
        emit(lng, lat)
      })
    }

    return () => {
      // Defer teardown one macrotask. StrictMode's remount above runs first and
      // cancels this, so the map is only really destroyed on a genuine unmount —
      // by which point its style has loaded and remove() aborts nothing.
      teardownTimerRef.current = window.setTimeout(() => {
        teardownTimerRef.current = null
        try {
          markerRef.current?.remove()
          mapRef.current?.remove()
        } catch {
          // Benign teardown races — safe to ignore.
        }
        mapRef.current = null
        markerRef.current = null
        markerAddedRef.current = false
        lastCoordRef.current = null
        radiusReadyRef.current = false
      }, 0)
    }
    // Map is created once; coordinate prop changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recentre when coordinates change from the outside (e.g. autocomplete resolve).
  useEffect(() => {
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return
    if (!isValidCoord(latitude, longitude)) return

    const last = lastCoordRef.current
    if (last && last.latitude === latitude && last.longitude === longitude) return

    lastCoordRef.current = { latitude, longitude }
    marker.setLngLat([longitude, latitude])
    if (!markerAddedRef.current) {
      marker.addTo(map)
      markerAddedRef.current = true
    }
    map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), DEFAULT_ZOOM) })
  }, [latitude, longitude])

  return <div ref={containerRef} className={cn('h-56 w-full overflow-hidden rounded-xl', className)} />
}
