import { safeJsonParse } from './palette-shared'
import { PRODUCT_COLLECTION_KEY_PREFIX } from './product-collection-palette'
import type { SignatureLandingGroup, SignatureLandingMap } from './types'

export const PRODUCT_SIGNATURE_KEY = `${PRODUCT_COLLECTION_KEY_PREFIX}signature`

export const isProductSignatureKey = (key: string | null | undefined): boolean => key === PRODUCT_SIGNATURE_KEY

let uidCounter = 0
export const nextSignatureGroupUid = (): string => `signature-group-${++uidCounter}`

export const parseSignatureLandingMap = (raw: unknown): SignatureLandingMap => {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

  const map: SignatureLandingMap = {}
  for (const [productId, url] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof url === 'string' && productId) map[productId] = url
  }

  return map
}

export const groupSignatureLandings = (map: SignatureLandingMap): SignatureLandingGroup[] => {
  const byUrl = new Map<string, SignatureLandingGroup>()

  for (const [productId, url] of Object.entries(map)) {
    const existing = byUrl.get(url)
    if (existing) existing.productIds.push(productId)
    else byUrl.set(url, { uid: nextSignatureGroupUid(), url, productIds: [productId] })
  }

  return [...byUrl.values()]
}

export const flattenSignatureLandings = (groups: SignatureLandingGroup[]): SignatureLandingMap => {
  const map: SignatureLandingMap = {}

  for (const group of groups) {
    const url = group.url.trim()
    if (!url) continue
    for (const productId of group.productIds) map[productId] = url
  }

  return map
}

export const stringifySignatureLandings = (groups: SignatureLandingGroup[]): string =>
  JSON.stringify(flattenSignatureLandings(groups), null, 2)

export const emptySignatureLandingGroup = (): SignatureLandingGroup => ({
  uid: nextSignatureGroupUid(),
  url: '',
  productIds: []
})
