/** Các shape mà config registry (`config-registry.ts`) tạo ra; luật phân loại nằm bên đó. */
import type { Config } from './config'

export const CATEGORY_SECTIONS = [
  'storefront',
  'b2b',
  'commerce',
  'cards',
  'automation',
  'integrations',
  'platform',
  'other'
] as const

export type CategorySection = (typeof CATEGORY_SECTIONS)[number]

export type CategoryId = string

export interface ConfigCategory {
  id: CategoryId
  section: CategorySection
  /** Key i18n trong namespace của tenant. Không có với category `other:` sinh tự động. */
  labelKey?: string
  /** Slug group thô, dùng làm label cho category `other:` sinh tự động. */
  fallbackLabel?: string
  /** Vị trí trong section của nó. Category sinh tự động xếp alphabet sau các mục này. */
  order: number
  /** `true` khi category sinh ra từ dữ liệu lạ chứ không phải được khai báo ở đây. */
  isSynthesised: boolean
}

export type CategorizeWarningCode =
  /** `value.group` lệch với prefix của key; đã lấy theo prefix. */
  | 'group-key-mismatch'
  /**
   * Key không có dấu `.` nên không thoả `KEY_REGEX_STRICT` (`group.sub_key`) và cũng không có
   * group thật - lấy cả key làm group. Record vẫn được xếp, vào `other:<key>`.
   */
  | 'malformed-key'
  /** Không còn gì dùng được: không prefix key, không `value.group`, không group ở tầng ngoài. */
  | 'missing-group'
  /** Hai record trùng id; chỉ giữ lại bản đầu tiên. */
  | 'duplicate-id'

export interface CategorizeWarning {
  code: CategorizeWarningCode
  configId: string
  configKey: string
  detail: string
}

export interface CategorizeResult {
  /** Mọi category cần render: loại khai báo sẵn trước (theo thứ tự quy trình), rồi tới loại sinh tự động. */
  categories: ConfigCategory[]
  /** Category id -> các record của nó, theo thứ tự đầu vào. Category khai báo sẵn xuất hiện cả khi rỗng. */
  byCategory: Map<CategoryId, Config[]>
  /** Config id -> category id. Mỗi record đầu vào đúng một entry. */
  assignments: Map<string, CategoryId>
  warnings: CategorizeWarning[]
}

export type SpecializedDialog =
  | 'product-collection'
  | 'feedbacks'
  | 'banners'
  | 'promotion-popup'
  | 'checkout-methods'
  | 'card-sizes'
  | 'calligraphy'

export type EditorTarget =
  /** `UpdateConfigDialog`. Dùng được cho mọi record vì nó sửa phần định nghĩa, không phải document đã parse. */
  | { type: 'generic'; wide: boolean }
  | { type: 'dialog'; dialog: SpecializedDialog }
  | { type: 'route'; route: 'b2b-overview' }
  | { type: 'route'; route: 'b2b-service'; slug: string }
