import type { AhamoveServiceRequest, AhamoveTier } from '../../types/ahamove.type'

export const normalizeAhamoveKey = (id: string): string => {
  const normalized = id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return /^[a-z]/.test(normalized) ? normalized : `r_${normalized}`
}

export const isVietnamese = (locale: string | undefined) => (locale ?? '').toLowerCase().startsWith('vi')

const pick = (
  vi: string | null | undefined,
  en: string | null | undefined,
  fallback?: string | null
): string | undefined => {
  const value = vi ?? en ?? fallback
  return value ? value.toString() : undefined
}

export const localizedAhamoveName = (request: AhamoveServiceRequest, locale: string | undefined): string =>
  (isVietnamese(locale)
    ? pick(request.name_vi_vn, request.name_en_us, request.name)
    : pick(request.name_en_us, request.name_vi_vn, request.name)) ?? request._id

export const localizedAhamoveDescription = (
  request: AhamoveServiceRequest,
  locale: string | undefined
): string | undefined =>
  isVietnamese(locale)
    ? pick(request.description_vi_vn, request.description_en_us, request.description)
    : pick(request.description_en_us, request.description_vi_vn, request.description)

export const localizedTierName = (tier: AhamoveTier, locale: string | undefined): string =>
  (isVietnamese(locale) ? (tier.name_vi_vn ?? tier.name_en_us) : (tier.name_en_us ?? tier.name_vi_vn)) ?? tier.code

export interface AhamovePayloadInput {
  num?: number
  tier_code?: string
  name?: string
  price?: number
}

export const buildAhamovePayload = (
  request: AhamoveServiceRequest,
  input: AhamovePayloadInput
): Record<string, unknown> => {
  switch (request.type) {
    case 'BOOLEAN':
      return { _id: request._id, num: input.num ?? 1 }

    case 'TIER':
      return { _id: request._id, tier_code: input.tier_code ?? '' }

    case 'INPUT':
    case 'PER_UNIT':
      return { _id: request._id, name: input.name ?? '', price: input.price ?? 0 }

    default:
      return { _id: request._id }
  }
}

export const defaultAhamoveInput = (request: AhamoveServiceRequest): AhamovePayloadInput => {
  switch (request.type) {
    case 'BOOLEAN':
      return { num: 1 }
    case 'TIER':
      return { tier_code: request.tier_list?.[0]?.code ?? '' }
    case 'INPUT':
    case 'PER_UNIT':
      return { name: '', price: request.price ?? 0 }
    default:
      return {}
  }
}
