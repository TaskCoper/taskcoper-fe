import goongjs, { type Map as GoongMap, type Marker as GoongMarker } from '@goongmaps/goong-js'
import '@goongmaps/goong-js/dist/goong-js.css'
import { useEffect, useRef } from 'react'

goongjs.accessToken = import.meta.env.VITE_GOONG_MAP_TILE_API_KEY

interface CompanyAddressMapProps {
  latitude: number
  longitude: number
}

export default function CompanyAddressMap({ latitude, longitude }: CompanyAddressMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<GoongMap | null>(null)
  const markerRef = useRef<GoongMarker | null>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    if (!latitude || !longitude) return

    const map = new goongjs.Map({
      container: containerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [longitude, latitude],
      zoom: 15
    })

    mapRef.current = map
    markerRef.current = new goongjs.Marker().setLngLat([longitude, latitude]).addTo(map)
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
