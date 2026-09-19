import { getPlainTextFromHtml } from '@/shared/utils'
import { safeJsonParse } from './palette-shared'
import { ConfigKind, InputType, type Config } from './types'
import type { CreateConfigFormValues } from './validations'

export const POSTGEN_GROUP = 'postgen'

export const POSTGEN_SYSTEM_PROMPT_PREFIX = `${POSTGEN_GROUP}.system-prompt.`

/** Platforms shipped out of the box; more can be added from the UI, so this is only a seed order. */
export const DEFAULT_POSTGEN_PLATFORMS = ['zalo', 'instagram', 'facebook'] as const

export type DefaultPostgenPlatform = (typeof DEFAULT_POSTGEN_PLATFORMS)[number]

export const postgenSystemPromptKey = (platform: string): string => `${POSTGEN_SYSTEM_PROMPT_PREFIX}${platform}`

export const POSTGEN_IMAGE_INSTRUCTION_KEY = `${POSTGEN_GROUP}.image_instruction`
export const POSTGEN_ENABLED_KEY = `${POSTGEN_GROUP}.enabled`

export const POSTGEN_IMAGE_INSTRUCTION_DOC = { key: POSTGEN_IMAGE_INSTRUCTION_KEY }

export const isPostgenEnabledKey = (key: string | null | undefined): boolean => key === POSTGEN_ENABLED_KEY

export const isPostgenImageInstructionKey = (key: string | null | undefined): boolean =>
  key === POSTGEN_IMAGE_INSTRUCTION_KEY

// Slugs are a single trailing segment: `postgen.system-prompt.tiktok`, never `...tiktok.vi`.
export const POSTGEN_PLATFORM_SLUG_REGEX = /^[a-z0-9][a-z0-9-]*$/

export const isValidPostgenPlatformSlug = (slug: string): boolean => POSTGEN_PLATFORM_SLUG_REGEX.test(slug)

export const postgenPlatformSlug = (key: string): string => {
  if (!key.startsWith(POSTGEN_SYSTEM_PROMPT_PREFIX)) return ''
  const slug = key.slice(POSTGEN_SYSTEM_PROMPT_PREFIX.length)
  return isValidPostgenPlatformSlug(slug) ? slug : ''
}

export const isPostgenSystemPromptKey = (key: string | null | undefined): boolean =>
  !!key && postgenPlatformSlug(key) !== ''

// BE derives the group from the key prefix, but rows seeded by hand can carry a different
// casing; match on either so the tab stays whole.
export const matchesPostgenConfig = (config: Config): boolean =>
  config.value.group.toLowerCase() === POSTGEN_GROUP || config.key.startsWith(`${POSTGEN_GROUP}.`)

/** Prompts are stored as the editor's raw HTML string; anything else is treated as empty. */
export const parsePostgenHtml = (raw: unknown): string => (typeof raw === 'string' ? raw : '')

// TipTap leaves `<p></p>` behind once every character is deleted, so "has text" is the real check.
export const isBlankPostgenHtml = (html: string): boolean => getPlainTextFromHtml(html).trim().length === 0

/** Per-platform metadata that isn't the prompt itself. */
export interface PostgenPlatformMeta {
  logo: string
  isActive: boolean
}

export interface PostgenPlatform extends PostgenPlatformMeta {
  slug: string
  key: string
  label: string
  html: string
  config: Config | null
}

export const defaultPostgenPlatformMeta = (): PostgenPlatformMeta => ({ logo: '', isActive: true })

/**
 * `ConfigDefinition` has no slot for a logo or an on/off flag, so platform metadata rides along
 * in `description` as a small JSON blob - that keeps `value.value` a plain prompt string for the
 * BE and ties the metadata to its platform record (delete the record, the metadata goes with it).
 * A bare string is read as a logo URL, which is how the first version of this palette stored it.
 */
export const parsePostgenPlatformMeta = (raw: unknown): PostgenPlatformMeta => {
  if (typeof raw !== 'string' || !raw.trim()) return defaultPostgenPlatformMeta()

  const description = raw.trim()
  const parsed = description.startsWith('{') ? safeJsonParse(description) : null

  if (!parsed || typeof parsed !== 'object') return { logo: description, isActive: true }

  const meta = parsed as Partial<PostgenPlatformMeta>

  return {
    logo: typeof meta.logo === 'string' ? meta.logo.trim() : '',
    // An existing record with no flag is treated as on; only an explicit `false` disables it.
    isActive: meta.isActive !== false
  }
}

export const serializePostgenPlatformMeta = ({ logo, isActive }: PostgenPlatformMeta): string =>
  JSON.stringify({ logo: logo.trim(), isActive })

export const toPostgenPlatform = (config: Config): PostgenPlatform => {
  const slug = postgenPlatformSlug(config.key)

  return {
    ...parsePostgenPlatformMeta(config.value.description),
    slug,
    key: config.key,
    label: config.value.label || slug,
    html: parsePostgenHtml(config.value.value),
    config
  }
}

export const emptyPostgenPlatform = (slug: string, label: string): PostgenPlatform => ({
  ...defaultPostgenPlatformMeta(),
  slug,
  key: postgenSystemPromptKey(slug),
  label,
  html: '',
  config: null
})

/**
 * Built-in platforms first, in their declared order, so the tabs don't reshuffle when the API
 * changes order or when a record is created; platforms added later follow in API order.
 * A built-in with no record yet still gets a tab - that's where its first prompt is written.
 */
export const listPostgenPlatforms = (configs: Config[], defaultLabel: (slug: string) => string): PostgenPlatform[] => {
  const existing = configs.filter((config) => isPostgenSystemPromptKey(config.key)).map(toPostgenPlatform)
  const existingBySlug = new Map(existing.map((platform) => [platform.slug, platform]))

  const defaults = DEFAULT_POSTGEN_PLATFORMS.map(
    (slug) => existingBySlug.get(slug) ?? emptyPostgenPlatform(slug, defaultLabel(slug))
  )
  const extras = existing.filter(
    (platform) => !DEFAULT_POSTGEN_PLATFORMS.includes(platform.slug as DefaultPostgenPlatform)
  )

  return [...defaults, ...extras]
}

interface PostgenDocBodyInput {
  key: string
  label: string
  html: string
  /** Serialized into `value.description`; only platform records carry it. */
  meta?: PostgenPlatformMeta
  isPublic?: boolean
}

export const buildPostgenDocBody = ({
  key,
  label,
  html,
  meta,
  isPublic = false
}: PostgenDocBodyInput): CreateConfigFormValues => ({
  key,
  isPublic,
  group: POSTGEN_GROUP,
  kind: ConfigKind.setting,
  value: {
    group: POSTGEN_GROUP,
    label,
    inputType: InputType.textarea,
    description: meta ? serializePostgenPlatformMeta(meta) : undefined,
    required: false,
    options: [],
    validations: [],
    value: html
  }
})

interface PostgenEnabledBodyInput {
  label: string
  enabled: boolean
  isPublic?: boolean
}

export const buildPostgenEnabledBody = ({
  label,
  enabled,
  isPublic = false
}: PostgenEnabledBodyInput): CreateConfigFormValues => ({
  key: POSTGEN_ENABLED_KEY,
  isPublic,
  group: POSTGEN_GROUP,
  kind: ConfigKind.setting,
  value: {
    group: POSTGEN_GROUP,
    label,
    inputType: InputType.boolean,
    required: false,
    options: [],
    validations: [],
    value: enabled
  }
})
