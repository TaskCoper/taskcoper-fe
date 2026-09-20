import { getPlainTextFromHtml } from '@/shared/utils'
import { normalizeGroup } from './palette-shared'
import { ConfigKind, InputType, type Config } from './types'
import type { CreateConfigFormValues } from './validations'

/**
 * Nhóm prompt dùng để AI dựng ẢNH (hoa và thiệp đi kèm).
 * Tách hẳn khỏi `postgen` - nhóm đó chỉ lo nội dung chữ cho bài đăng mạng xã hội -
 * để hai loại prompt không bị lẫn khi vận hành.
 */
export const IMAGEGEN_GROUP = 'imagegen'

/** Prompt dựng ảnh bó hoa. */
export const IMAGEGEN_FLOWER_PROMPT_KEY = `${IMAGEGEN_GROUP}.flower_prompt`
/** Prompt dựng thiệp đi kèm bó hoa; chạy cùng prompt hoa nên để chung nhóm. */
export const IMAGEGEN_CARD_PROMPT_KEY = `${IMAGEGEN_GROUP}.card_prompt`

export const IMAGEGEN_PROMPT_KEYS = [IMAGEGEN_FLOWER_PROMPT_KEY, IMAGEGEN_CARD_PROMPT_KEY] as const

export type ImagegenPromptKey = (typeof IMAGEGEN_PROMPT_KEYS)[number]

export const isImagegenPromptKey = (key: string | null | undefined): boolean =>
  !!key && IMAGEGEN_PROMPT_KEYS.includes(key as ImagegenPromptKey)

// BE lấy group từ prefix của key, nhưng record seed tay có thể lưu `value.group` khác casing;
// nhận cả hai đường để tab không bị vỡ.
export const matchesImagegenConfig = (config: Config): boolean =>
  normalizeGroup(config.value?.group) === IMAGEGEN_GROUP || config.key.startsWith(`${IMAGEGEN_GROUP}.`)

/** Prompt lưu thẳng chuỗi từ editor; giá trị khác kiểu coi như rỗng. */
export const parseImagegenHtml = (raw: unknown): string => (typeof raw === 'string' ? raw : '')

// TipTap vẫn để lại `<p></p>` sau khi xoá hết chữ, nên phải kiểm tra theo plain text.
export const isBlankImagegenHtml = (html: string): boolean => getPlainTextFromHtml(html).trim().length === 0

interface ImagegenDocBodyInput {
  key: string
  label: string
  html: string
  isPublic?: boolean
}

/** Body giống hệt doc của `postgen`: một record `setting` với `inputType` textarea. */
export const buildImagegenDocBody = ({
  key,
  label,
  html,
  isPublic = false
}: ImagegenDocBodyInput): CreateConfigFormValues => ({
  key,
  isPublic,
  group: IMAGEGEN_GROUP,
  kind: ConfigKind.setting,
  value: {
    group: IMAGEGEN_GROUP,
    label,
    inputType: InputType.textarea,
    required: false,
    options: [],
    validations: [],
    value: html
  }
})
