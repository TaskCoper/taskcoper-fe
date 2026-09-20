import {
  B2B_SERVICES_GROUP,
  b2bServicesKeySuffix,
  isB2BOverviewKey,
  matchesB2BServicesConfig
} from './b2b-service-detail-palette'
import { BANNERS_GROUP, matchesBannerKey } from './banners-palette'
import { CARD_CONFIG_GROUP, isCardPricesKey, isCardSizesKey } from './card-config-palette'
import {
  CHECKOUT_CONFIG_GROUP,
  isCheckoutDeliveryMethodsKey,
  isCheckoutPaymentMethodsKey,
  matchesCheckoutMethodsKey
} from './checkout-methods-palette'
import { FEEDBACKS_GROUP, matchesFeedbacksKey } from './feedbacks-palette'
import { IMAGEGEN_GROUP, isImagegenPromptKey } from './imagegen-palette'
import { LOCKED_ASYNC_CONFIG_KEYS, isLockedAsyncConfigKey } from './locked-config-keys'
import { normalizeGroup } from './palette-shared'
import {
  POSTGEN_GROUP,
  isPostgenEnabledKey,
  isPostgenImageInstructionKey,
  isPostgenSystemPromptKey
} from './postgen-palette'
import { PRODUCT_COLLECTION_GROUP, matchesProductCollectionConfig } from './product-collection-palette'
import { PROMOTION_POPUP_GROUP, isPromotionPopupKey } from './promotion-popup-palette'
import { isProductSignatureKey } from './signature-landing-palette'
import {
  CATEGORY_SECTIONS,
  ConfigKind,
  InputType,
  type CategorizeResult,
  type CategorizeWarning,
  type CategoryId,
  type Config,
  type ConfigCategory,
  type EditorTarget
} from './types'

export const OTHER_CATEGORY_PREFIX = 'other:'

export const CONFIG_CATEGORIES: readonly ConfigCategory[] = [
  { id: 'banners', section: 'storefront', labelKey: 'configsPage.category.banners', order: 10, isSynthesised: false },
  {
    id: 'product-collections',
    section: 'storefront',
    labelKey: 'configsPage.category.productCollections',
    order: 20,
    isSynthesised: false
  },
  {
    id: 'signature-landing',
    section: 'storefront',
    labelKey: 'configsPage.category.signatureLanding',
    order: 30,
    isSynthesised: false
  },
  {
    id: 'feedbacks',
    section: 'storefront',
    labelKey: 'configsPage.category.feedbacks',
    order: 40,
    isSynthesised: false
  },
  {
    id: 'promotion-popup',
    section: 'storefront',
    labelKey: 'configsPage.category.promotionPopup',
    order: 50,
    isSynthesised: false
  },

  { id: 'b2b', section: 'b2b', labelKey: 'configsPage.category.b2b', order: 10, isSynthesised: false },

  {
    id: 'payment-methods',
    section: 'commerce',
    labelKey: 'configsPage.category.paymentMethods',
    order: 10,
    isSynthesised: false
  },
  {
    id: 'delivery-methods',
    section: 'commerce',
    labelKey: 'configsPage.category.deliveryMethods',
    order: 20,
    isSynthesised: false
  },

  { id: 'card-sizes', section: 'cards', labelKey: 'configsPage.category.cardSizes', order: 10, isSynthesised: false },
  {
    id: 'calligraphy',
    section: 'cards',
    labelKey: 'configsPage.category.calligraphy',
    order: 20,
    isSynthesised: false
  },

  { id: 'postgen', section: 'automation', labelKey: 'configsPage.category.postgen', order: 10, isSynthesised: false },
  {
    id: 'imagegen',
    section: 'automation',
    labelKey: 'configsPage.category.imagegen',
    order: 20,
    isSynthesised: false
  },

  { id: 'nhanhvn', section: 'integrations', labelKey: 'configsPage.category.nhanhvn', order: 10, isSynthesised: false },
  { id: 'ahamove', section: 'integrations', labelKey: 'configsPage.category.ahamove', order: 20, isSynthesised: false },

  { id: 'contact', section: 'platform', labelKey: 'configsPage.category.contact', order: 5, isSynthesised: false },
  { id: 'company', section: 'platform', labelKey: 'configsPage.category.company', order: 6, isSynthesised: false },
  { id: 'secrets', section: 'platform', labelKey: 'systemConfigs.kind.secret', order: 40, isSynthesised: false }
]

const CATEGORY_BY_ID = new Map(CONFIG_CATEGORIES.map((c) => [c.id, c]))

export const isDeclaredCategory = (id: CategoryId): boolean => CATEGORY_BY_ID.has(id)
const SECTION_ORDER = new Map(CATEGORY_SECTIONS.map((s, i) => [s, i]))

export const getCategory = (id: CategoryId): ConfigCategory | undefined => CATEGORY_BY_ID.get(id)

export const DEFAULT_CATEGORY_ID: CategoryId = CONFIG_CATEGORIES[0].id

const AHAMOVE_GROUP = 'ahamove'
const NHANHVN_GROUP = normalizeGroup(LOCKED_ASYNC_CONFIG_KEYS.defaultDepot.split('.')[0])

export const keyPrefix = (key: string): string => (typeof key === 'string' ? (key.split('.')[0] ?? '') : '')

/**
 * Lấy group của config và normalize để so sánh.
 * Ưu tiên prefix của `key`, sau đó mới đến `value.group` và `config.group`.
 * Hai luồng lưu đều lấy group từ key trước; `configExportSchema` cũng không cho lưu
 * nếu `value.group` khác prefix. Vì vậy, phân nhóm theo key là nhất quán với dữ liệu được lưu.
 * Nếu phát hiện lệch group, `categorize` sẽ thêm warning thay vì tự sửa.
 */
export const groupOf = (config: Config): string =>
  normalizeGroup(keyPrefix(config.key)) || normalizeGroup(config.value?.group) || normalizeGroup(config.group)

/* Mapping cho legacy URLs */

export const LEGACY_SECTION_MAP: Readonly<Record<string, CategoryId>> = {
  banners: 'banners',
  feedbacks: 'feedbacks',
  products: 'product-collections',
  promotions: 'promotion-popup',
  checkout: 'payment-methods',
  card_config: 'card-sizes',
  b2bservices: 'b2b',
  postgen: 'postgen',
  nhanhvn: 'nhanhvn',
  ahamove: 'ahamove',
  contact: 'contact',
  company: 'company',
  general: 'general',
  feature: 'features',
  datesettings: 'dates',
  order: 'orders',
  payment: 'payment',
  shipping: 'shipping',
  reward: 'rewards'
}

/**
 * Category bị tách đôi: id cũ trong `?category=` trỏ về category đầu tiên của cặp mới,
 * để link đã lưu không rơi về category mặc định kèm thông báo "đã bị gỡ".
 */
export const RENAMED_CATEGORY_IDS: Readonly<Record<string, CategoryId>> = {
  checkout: 'payment-methods',
  'cards-calligraphy': 'card-sizes'
}

export const resolveRenamedCategory = (id: string | null | undefined): CategoryId | null => {
  const renamed = id ? RENAMED_CATEGORY_IDS[id] : undefined
  return renamed && isDeclaredCategory(renamed) ? renamed : null
}

/**
 * Chuyển `?kind=&section=` từ URL cũ sang category id hiện tại.
 * `knownCategoryIds` gồm cả category tự tạo dạng `other:` để giữ được group còn trong dữ liệu.
 * Trả về `null` nếu không tìm thấy; caller sẽ chọn category mặc định.
 */
export const resolveLegacyCategory = (
  { section, kind }: { section?: string | null; kind?: string | null },
  knownCategoryIds: ReadonlySet<CategoryId> = new Set()
): CategoryId | null => {
  const normalizedSection = normalizeGroup(section)

  if (normalizedSection) {
    const mapped = LEGACY_SECTION_MAP[normalizedSection]
    // Chỉ dùng mapping nếu category còn được khai báo; nếu không, thử tìm trong `other:`.
    if (mapped && isDeclaredCategory(mapped)) return mapped

    // Section không có mapping vẫn dùng được nếu dữ liệu có group tương ứng.
    const other = `${OTHER_CATEGORY_PREFIX}${normalizedSection}`
    if (knownCategoryIds.has(other)) return other
  }

  // Chỉ `?kind=secret` có category riêng; các kind khác chỉ dùng để lưu trữ,
  // nên sẽ chuyển về category mặc định.
  if (normalizeGroup(kind) === ConfigKind.secret && isDeclaredCategory('secrets')) return 'secrets'

  return null
}

/**
 * Lấy group chung để tự điền key prefix khi tạo field mới.
 * Trả về `null` nếu category rỗng hoặc có nhiều group; khi đó user tự nhập đầy đủ key.
 */
export const primaryGroupOf = (configs: readonly Config[]): string | null => {
  const groups = new Set(configs.map(groupOf).filter(Boolean))
  return groups.size === 1 ? [...groups][0] : null
}

/* Thứ tự ưu tiên của rules */

/**
 * Rule có rank cao hơn (số nhỏ hơn) được xét trước; rule match đầu tiên sẽ thắng.
 * Nhờ đó mỗi config chỉ thuộc một category, không phụ thuộc thứ tự input.
 *
 * 0 kind       - Ưu tiên secret, không để secret lọt vào category khác.
 * 1 exact key  - Key cố định của từng config riêng lẻ (singleton).
 * 2 key+shape  - Kiểm tra cả key và cấu trúc dữ liệu.
 * 3 key prefix - Nhận diện các nhóm key có thể mở rộng.
 * 4 group      - Phân nhóm chung, kể cả config cùng họ nhưng khác shape.
 * fallback     - Dùng `other:<group>` nếu không có rule phù hợp.
 */
export const RULE_RANKS = [0, 1, 2, 3, 4] as const
export type RuleRank = (typeof RULE_RANKS)[number]

interface CategoryRule {
  rank: RuleRank
  category: CategoryId
  match: (config: Config) => boolean
}

const groupIs =
  (group: string) =>
  (config: Config): boolean =>
    groupOf(config) === normalizeGroup(group)

const RULES: readonly CategoryRule[] = [
  // rank 0: ưu tiên kind
  { rank: 0, category: 'secrets', match: (c) => c.kind === ConfigKind.secret },

  // rank 1: khớp chính xác key
  { rank: 1, category: 'b2b', match: (c) => isB2BOverviewKey(c.key) },
  { rank: 1, category: 'promotion-popup', match: (c) => isPromotionPopupKey(c.key) },
  { rank: 1, category: 'payment-methods', match: (c) => isCheckoutPaymentMethodsKey(c.key) },
  { rank: 1, category: 'delivery-methods', match: (c) => isCheckoutDeliveryMethodsKey(c.key) },
  { rank: 1, category: 'card-sizes', match: (c) => isCardSizesKey(c.key) },
  { rank: 1, category: 'calligraphy', match: (c) => isCardPricesKey(c.key) },
  { rank: 1, category: 'signature-landing', match: (c) => isProductSignatureKey(c.key) },
  { rank: 1, category: 'postgen', match: (c) => isPostgenEnabledKey(c.key) || isPostgenImageInstructionKey(c.key) },
  { rank: 1, category: 'imagegen', match: (c) => isImagegenPromptKey(c.key) },
  { rank: 1, category: 'nhanhvn', match: (c) => isLockedAsyncConfigKey(c.key) },

  // rank 2: khớp key prefix và shape
  { rank: 2, category: 'b2b', match: matchesB2BServicesConfig },
  { rank: 2, category: 'product-collections', match: matchesProductCollectionConfig },

  // rank 3: khớp key prefix
  { rank: 3, category: 'feedbacks', match: (c) => matchesFeedbacksKey(c.key) },
  { rank: 3, category: 'banners', match: (c) => matchesBannerKey(c.key) },
  { rank: 3, category: 'postgen', match: (c) => isPostgenSystemPromptKey(c.key) },
  { rank: 3, category: 'ahamove', match: (c) => c.key.startsWith(`${AHAMOVE_GROUP}.`) },

  // rank 4: phân loại theo group.
  // Giữ config sai shape trong nhóm gốc, không đẩy sang `other:`.
  { rank: 4, category: 'banners', match: groupIs(BANNERS_GROUP) },
  { rank: 4, category: 'feedbacks', match: groupIs(FEEDBACKS_GROUP) },
  { rank: 4, category: 'product-collections', match: groupIs(PRODUCT_COLLECTION_GROUP) },
  { rank: 4, category: 'promotion-popup', match: groupIs(PROMOTION_POPUP_GROUP) },
  // Hai group dưới đây trải trên hai category; key lạ trong group về category đầu của cặp
  // và hiện ở phần "bản ghi chưa hỗ trợ" của category đó.
  { rank: 4, category: 'payment-methods', match: groupIs(CHECKOUT_CONFIG_GROUP) },
  { rank: 4, category: 'card-sizes', match: groupIs(CARD_CONFIG_GROUP) },
  { rank: 4, category: 'b2b', match: groupIs(B2B_SERVICES_GROUP) },
  { rank: 4, category: 'postgen', match: groupIs(POSTGEN_GROUP) },
  { rank: 4, category: 'imagegen', match: groupIs(IMAGEGEN_GROUP) },
  { rank: 4, category: 'nhanhvn', match: groupIs(NHANHVN_GROUP) },
  { rank: 4, category: 'ahamove', match: groupIs(AHAMOVE_GROUP) },
  // Các group chung từ backend; slug lấy từ `systemConfigs.groups` trong tenant locales.
  { rank: 4, category: 'contact', match: groupIs('contact') },
  { rank: 4, category: 'company', match: groupIs('company') },
  { rank: 4, category: 'general', match: groupIs('general') },
  { rank: 4, category: 'features', match: groupIs('feature') },
  { rank: 4, category: 'dates', match: groupIs('dateSettings') },
  { rank: 4, category: 'orders', match: groupIs('order') },
  { rank: 4, category: 'payment', match: groupIs('payment') },
  { rank: 4, category: 'shipping', match: groupIs('shipping') },
  { rank: 4, category: 'rewards', match: groupIs('reward') }
]

/** Xác định category của một config; luôn trả về một id. */
export const categoryOf = (config: Config): CategoryId => {
  for (const rule of RULES) {
    // Nếu category bị bỏ khỏi `CONFIG_CATEGORIES`, không đưa config vào category ẩn.
    // Bỏ qua rule này để config rơi về `other:` có label hiển thị được.
    if (rule.match(config) && isDeclaredCategory(rule.category)) return rule.category
  }
  const group = groupOf(config)
  return `${OTHER_CATEGORY_PREFIX}${group}`
}

const compareCategories = (a: ConfigCategory, b: ConfigCategory): number => {
  const sectionDiff = (SECTION_ORDER.get(a.section) ?? 0) - (SECTION_ORDER.get(b.section) ?? 0)
  if (sectionDiff !== 0) return sectionDiff
  if (a.order !== b.order) return a.order - b.order
  return a.id.localeCompare(b.id)
}

/**
 * Phân mỗi config vào đúng một category.
 * Các điều kiện được kiểm tra trong `config-registry.test.ts`:
 * - totality: mỗi record hợp lệ, không trùng id, xuất hiện trong đúng một bucket.
 * - uniqueness: không lặp record; id trùng chỉ giữ record đầu tiên.
 * - determinism: đổi thứ tự input không làm đổi category hay thứ tự category.
 * - immutability: không sửa trực tiếp object đầu vào.
 */
export const categorize = (configs: readonly Config[]): CategorizeResult => {
  const byCategory = new Map<CategoryId, Config[]>()
  const assignments = new Map<string, CategoryId>()
  const warnings: CategorizeWarning[] = []
  const synthesised = new Map<CategoryId, ConfigCategory>()

  // Category khai báo sẵn luôn hiển thị, kể cả rỗng, để có trạng thái "chưa cấu hình".
  for (const category of CONFIG_CATEGORIES) byCategory.set(category.id, [])

  for (const config of configs) {
    if (assignments.has(config.id)) {
      warnings.push({
        code: 'duplicate-id',
        configId: config.id,
        configKey: config.key,
        detail: 'A record with this id was already assigned; the later one was dropped.'
      })
      continue
    }

    const prefix = normalizeGroup(keyPrefix(config.key))
    const declared = normalizeGroup(config.value?.group)
    if (prefix && declared && prefix !== declared) {
      warnings.push({
        code: 'group-key-mismatch',
        configId: config.id,
        configKey: config.key,
        detail: `value.group "${declared}" does not match key prefix "${prefix}"; filed under the key prefix.`
      })
    }
    if (typeof config.key === 'string' && config.key.length > 0 && !config.key.includes('.')) {
      warnings.push({
        code: 'malformed-key',
        configId: config.id,
        configKey: config.key,
        detail: 'Key has no "." so it cannot match the group.sub_key format the schema enforces.'
      })
    }
    if (!groupOf(config)) {
      warnings.push({
        code: 'missing-group',
        configId: config.id,
        configKey: config.key,
        detail: 'No key prefix, no value.group and no top-level group.'
      })
    }

    const categoryId = categoryOf(config)
    assignments.set(config.id, categoryId)

    const bucket = byCategory.get(categoryId)
    if (bucket) {
      bucket.push(config)
    } else {
      byCategory.set(categoryId, [config])
      synthesised.set(categoryId, {
        id: categoryId,
        section: 'other',
        // Không cắt prefix mù quáng: category bị tắt có thể tạo id như `orders`,
        // không bắt đầu bằng `other:`; cắt sai sẽ làm label rỗng.
        fallbackLabel: categoryId.startsWith(OTHER_CATEGORY_PREFIX)
          ? categoryId.slice(OTHER_CATEGORY_PREFIX.length)
          : categoryId,
        // Sort theo alphabet bên dưới để thứ tự input không ảnh hưởng nav.
        order: 0,
        isSynthesised: true
      })
    }
  }

  const categories = [...CONFIG_CATEGORIES, ...[...synthesised.values()].sort((a, b) => a.id.localeCompare(b.id))].sort(
    compareCategories
  )

  return { categories, byCategory, assignments, warnings }
}

/**
 * Specialized dialog cần `inputType: json` vì sẽ parse `value.value` thành JSON document.
 * Không kiểm tra `kind`: dialog sẽ cập nhật lại khi lưu, tránh khóa editor nếu kind bị lệch.
 */
const isJsonDoc = (config: Config): boolean => config.value?.inputType === InputType.json

/**
 * Chọn editor phù hợp cho config.
 * Theo thứ tự xử lý của `configs.page.tsx#openEdit`, nhưng kiểm tra thêm shape.
 * Ví dụ: `matchesBannerKey` chỉ kiểm tra prefix, nên một key `banners.*` dạng text
 * có thể bị mở nhầm bằng collection dialog. Shape không đúng sẽ dùng `generic`.
 * Việc chọn editor độc lập với `categoryOf`: record đó vẫn nằm trong category `banners`.
 */
export const resolveEditor = (config: Config): EditorTarget => {
  if (matchesCheckoutMethodsKey(config.key) && isJsonDoc(config)) {
    return { type: 'dialog', dialog: 'checkout-methods' }
  }
  if (isPromotionPopupKey(config.key) && isJsonDoc(config)) {
    return { type: 'dialog', dialog: 'promotion-popup' }
  }
  // Matcher này đã tự kiểm tra shape.
  if (matchesProductCollectionConfig(config)) {
    return { type: 'dialog', dialog: 'product-collection' }
  }
  if (matchesFeedbacksKey(config.key) && isJsonDoc(config)) {
    return { type: 'dialog', dialog: 'feedbacks' }
  }
  if (matchesBannerKey(config.key) && isJsonDoc(config)) {
    return { type: 'dialog', dialog: 'banners' }
  }
  if (isCardSizesKey(config.key) && isJsonDoc(config)) {
    return { type: 'dialog', dialog: 'card-sizes' }
  }
  if (isCardPricesKey(config.key) && isJsonDoc(config)) {
    return { type: 'dialog', dialog: 'calligraphy' }
  }
  if (matchesB2BServicesConfig(config)) {
    return isB2BOverviewKey(config.key)
      ? { type: 'route', route: 'b2b-overview' }
      : { type: 'route', route: 'b2b-service', slug: b2bServicesKeySuffix(config.key) }
  }
  // `products.signature` không có dialog riêng: dùng generic editor bản rộng.
  // `update-config-dialog.tsx` cũng dựa vào `isProductSignatureKey` để xử lý.
  return { type: 'generic', wide: isProductSignatureKey(config.key) && isJsonDoc(config) }
}
