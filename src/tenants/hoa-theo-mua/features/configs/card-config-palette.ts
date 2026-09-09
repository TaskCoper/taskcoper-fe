import { safeJsonParse } from './palette-shared'

export const CARD_CONFIG_GROUP = 'card_config'
export const CARD_SIZES_KEY = `${CARD_CONFIG_GROUP}.sizes`
export const CARD_PRICES_KEY = `${CARD_CONFIG_GROUP}.prices`

export interface CardSize {
  name: string
  width: number
  height: number
  base_price: number
  max_words: number
}

export interface CalligraphyRule {
  min_words: number
  max_words: number
  extra_price: number
}

export const isCardSizesKey = (key: string | null | undefined): boolean => key === CARD_SIZES_KEY
export const isCardPricesKey = (key: string | null | undefined): boolean => key === CARD_PRICES_KEY

const toFiniteNumber = (raw: unknown, fallback = 0): number => {
  const value = typeof raw === 'string' ? Number(raw) : raw
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

// Nhận cả `{ items: [...] }` lẫn mảng trần, phòng khi record được seed thẳng bằng mảng.
const toItemArray = (raw: unknown): Record<string, unknown>[] => {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
  const list = Array.isArray(parsed) ? parsed : (parsed as { items?: unknown } | null)?.items

  if (!Array.isArray(list)) return []

  return list.filter(
    (item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item)
  )
}

export const defaultCardSize = (): CardSize => ({
  name: '',
  width: 0,
  height: 0,
  base_price: 0,
  max_words: 0
})

export const defaultCardSizes = (): CardSize[] => [defaultCardSize()]

export const parseCardSizes = (raw: unknown): CardSize[] =>
  toItemArray(raw).map((item) => ({
    name: typeof item.name === 'string' ? item.name : '',
    width: toFiniteNumber(item.width),
    height: toFiniteNumber(item.height),
    base_price: toFiniteNumber(item.base_price),
    max_words: toFiniteNumber(item.max_words)
  }))

export const defaultCalligraphyRules = (): CalligraphyRule[] => [
  { min_words: 0, max_words: 35, extra_price: 0 },
  { min_words: 36, max_words: 70, extra_price: 39000 },
  { min_words: 71, max_words: 100, extra_price: 69000 }
]

export const defaultCalligraphyRule = (previous?: CalligraphyRule): CalligraphyRule => ({
  min_words: previous ? previous.max_words + 1 : 0,
  max_words: previous ? previous.max_words + 1 : 0,
  extra_price: 0
})

export const parseCalligraphyRules = (raw: unknown): CalligraphyRule[] =>
  toItemArray(raw).map((item) => ({
    min_words: toFiniteNumber(item.min_words),
    max_words: toFiniteNumber(item.max_words),
    extra_price: toFiniteNumber(item.extra_price)
  }))

export const sortCalligraphyRules = (rules: CalligraphyRule[]): CalligraphyRule[] =>
  [...rules].sort((a, b) => a.min_words - b.min_words)

/** Cùng công thức với BE: `min_words <= word_count <= max_words`. Dùng cho preview trong dialog. */
export const resolveCalligraphyExtraPrice = (rules: CalligraphyRule[], wordCount: number): number | null =>
  rules.find((rule) => wordCount >= rule.min_words && wordCount <= rule.max_words)?.extra_price ?? null

export const maxWordsOfSizes = (sizes: CardSize[]): number =>
  sizes.reduce((max, size) => Math.max(max, size.max_words), 0)

export type CardSizesIssue =
  | { code: 'empty' }
  | { code: 'nameRequired'; index: number }
  | { code: 'duplicateName'; index: number }
  | { code: 'dimensionInvalid'; index: number }
  | { code: 'basePriceInvalid'; index: number }
  | { code: 'maxWordsInvalid'; index: number }

export const findCardSizesIssue = (sizes: CardSize[]): CardSizesIssue | null => {
  if (sizes.length === 0) return { code: 'empty' }

  const seenNames = new Set<string>()

  for (const [index, size] of sizes.entries()) {
    const name = size.name.trim().toLowerCase()
    if (!name) return { code: 'nameRequired', index }
    // Không còn key riêng cho từng size nên `name` là thứ duy nhất phân biệt các phần tử.
    if (seenNames.has(name)) return { code: 'duplicateName', index }
    seenNames.add(name)

    if (size.width <= 0 || size.height <= 0) return { code: 'dimensionInvalid', index }
    if (size.base_price < 0) return { code: 'basePriceInvalid', index }
    if (!Number.isInteger(size.max_words) || size.max_words <= 0) return { code: 'maxWordsInvalid', index }
  }

  return null
}

export type CalligraphyRulesIssue =
  | { code: 'empty' }
  | { code: 'negative'; index: number }
  | { code: 'reversed'; index: number }
  | { code: 'notStartingAtZero' }
  | { code: 'overlap'; index: number }
  | { code: 'gap'; index: number }

/**
 * Các bậc phải phủ liên tục từ 0 trở lên: hở một khoảng nghĩa là có số từ không match rule nào
 * và BE không tính được giá.
 */
export const findCalligraphyRulesIssue = (rules: CalligraphyRule[]): CalligraphyRulesIssue | null => {
  if (rules.length === 0) return { code: 'empty' }

  const sorted = sortCalligraphyRules(rules)

  for (const [index, rule] of sorted.entries()) {
    if (rule.min_words < 0 || rule.max_words < 0 || rule.extra_price < 0) return { code: 'negative', index }
    if (rule.min_words > rule.max_words) return { code: 'reversed', index }
  }

  if (sorted[0].min_words !== 0) return { code: 'notStartingAtZero' }

  for (let index = 1; index < sorted.length; index++) {
    const previous = sorted[index - 1]
    const current = sorted[index]
    if (current.min_words <= previous.max_words) return { code: 'overlap', index }
    if (current.min_words > previous.max_words + 1) return { code: 'gap', index }
  }

  return null
}
