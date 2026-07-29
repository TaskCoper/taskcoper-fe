import type { ShippingLocation } from '../features/orders/types'

const COMBINING_MARKS = /[̀-ͯ]/g
const ADMIN_PREFIX = /^(phuong|xa|thi tran|quan|huyen|thi xa|thanh pho|tinh)\s+/

const normalize = (value: string) =>
  value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Strips the admin-level prefix (e.g. "Phường", "Thành phố") so a VietMap name
// like "Phường Bến Nghé" still matches a backend option named "Bến Nghé".
const adminCoreName = (value: string) => normalize(value).replace(ADMIN_PREFIX, '').trim()

/**
 * Resolves a free-text VietMap ward/city name to the backend shipping-location
 * option it refers to. VietMap names carry admin prefixes and diacritics that
 * the backend list may omit, so we compare on the normalized "core" name and
 * fall back to a containment match before giving up.
 */
export const matchShippingLocation = (
  options: ShippingLocation[],
  rawName: string | undefined | null
): ShippingLocation | undefined => {
  const core = adminCoreName(rawName ?? '')
  if (!core) return undefined

  return (
    options.find((option) => adminCoreName(option.name) === core) ??
    options.find((option) => {
      const optionCore = adminCoreName(option.name)
      return optionCore.includes(core) || core.includes(optionCore)
    })
  )
}
