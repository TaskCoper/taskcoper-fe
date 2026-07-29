export const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

/** Plain grouped-number formatter (e.g. weights, counts) using the Vietnamese locale. */
export const numberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2
})
