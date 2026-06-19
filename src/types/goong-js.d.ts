declare module '@goongmaps/goong-js' {
  export type LngLat = [number, number]

  export interface MapOptions {
    container: HTMLElement | string
    style: string
    center: LngLat
    zoom: number
  }

  export interface FlyToOptions {
    center?: LngLat
    zoom?: number
    speed?: number
    curve?: number
  }

  export class Map {
    constructor(options: MapOptions)
    flyTo(options: FlyToOptions): this
    remove(): void
  }

  export class Marker {
    setLngLat(lngLat: LngLat): this
    addTo(map: Map): this
    remove(): this
  }

  export let accessToken: string

  const goongjs: {
    Map: typeof Map
    Marker: typeof Marker
    accessToken: string
  }

  export default goongjs
}

declare module '@goongmaps/goong-js/dist/goong-js.css'
