import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl'
import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css'
import { useEffect, useRef } from 'react'

type VietmapMap = InstanceType<typeof vietmapgl.Map>
type VietmapMarker = InstanceType<typeof vietmapgl.Marker>

interface VietmapAddressMapProps {
  latitude: number
  longitude: number
}

export default function VietmapAddressMap({ latitude, longitude }: VietmapAddressMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<VietmapMap | null>(null)
  const markerRef = useRef<VietmapMarker | null>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    if (!latitude || !longitude) return

    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${import.meta.env.VITE_VIETMAP_MAP_API_KEY}`,
      center: [longitude, latitude],
      zoom: 15
    })

    mapRef.current = map
    markerRef.current = new vietmapgl.Marker().setLngLat([longitude, latitude]).addTo(map)
  }, [latitude, longitude])

  useEffect(
    () => () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    },
    []
  )

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (!latitude || !longitude) return
    mapRef.current.flyTo({ center: [longitude, latitude] })
    markerRef.current.setLngLat([longitude, latitude])
  }, [latitude, longitude])

  return <div ref={containerRef} className='w-full h-80 rounded-xl overflow-hidden border' />
}
