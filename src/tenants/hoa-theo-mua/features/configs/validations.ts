import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { FEEDBACK_SOURCES, MAX_FEATURED_FEEDBACKS } from './feedbacks-palette'
import { isSafeHref, isValidPagePattern, pickerValueToYmd, POPUP_FREQUENCIES } from './promotion-popup-palette'
import { ConfigKind, InputType, type ConfigDefinition, type ValidationRule } from './types'

const KEY_REGEX_STRICT = /^[a-z][a-z0-9]*(_[a-z0-9]+)*(\.[a-z][a-z0-9]*(_[a-z0-9]+)*)+$/
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*$/

const validationRuleSchema = z.union([
  z.object({ minLength: z.number().int().min(0) }),
  z.object({ maxLength: z.number().int().min(0) }),
  z.object({ min: z.number() }),
  z.object({ max: z.number() }),
  z.object({ pattern: z.string() }),
  z.object({ enum: z.array(z.union([z.string(), z.number()])).min(1) }),
  z.object({ email: z.literal(true) }),
  z.object({ url: z.literal(true) }),
  z.object({ integer: z.literal(true) })
]) satisfies z.ZodType<ValidationRule>

const inputOptionSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()])
})

export const configDefinitionSchema = z
  .object({
    group: z.string().min(1),
    label: z.string().min(1),
    inputType: z.enum([
      'text',
      'textarea',
      'number',
      'boolean',
      'switch',
      'date',
      'select',
      'multiSelect',
      'json',
      'file',
      'address'
    ]),
    value: z.unknown(),
    description: z.string().max(500).optional(),
    required: z.boolean(),
    options: z.array(inputOptionSchema).optional(),
    validations: z.array(validationRuleSchema).default([])
  })
  .refine((d) => (d.inputType !== 'select' && d.inputType !== 'multiSelect') || (d.options?.length ?? 0) > 0, {
    message: "inputType 'select' hoặc 'multiSelect' phải có ít nhất 1 option",
    path: ['options']
  })

const applyStringRules = (base: z.ZodString, rules: ValidationRule[]): z.ZodString => {
  let out = base

  for (const r of rules) {
    if ('minLength' in r) {
      out = out.min(r.minLength, `Tối thiểu ${r.minLength} ký tự`)
    } else if ('maxLength' in r) {
      out = out.max(r.maxLength, `Tối đa ${r.maxLength} ký tự`)
    } else if ('pattern' in r) {
      out = out.regex(new RegExp(r.pattern), 'Sai định dạng')
    } else if ('email' in r) {
      out = out.refine((value) => z.email().safeParse(value).success, 'Email không hợp lệ')
    } else if ('url' in r) {
      out = out.refine((value) => z.url().safeParse(value).success, 'URL không hợp lệ')
    }
  }

  return out
}

const applyNumberRules = (base: z.ZodNumber, rules: ValidationRule[]): z.ZodNumber => {
  let out = base

  for (const r of rules) {
    if ('min' in r) {
      out = out.min(r.min, `Tối thiểu là ${r.min}`)
    } else if ('max' in r) {
      out = out.max(r.max, `Tối đa là ${r.max}`)
    } else if ('integer' in r) {
      out = out.int('Phải là số nguyên')
    }
  }

  return out
}

const literalUnion = (values: Array<string | number>): z.ZodTypeAny => {
  if (values.length === 0) return z.never()
  if (values.length === 1) return z.literal(values[0])
  return z.union(
    values.map((v) => z.literal(v)) as [
      z.ZodLiteral<string | number>,
      z.ZodLiteral<string | number>,
      ...z.ZodLiteral<string | number>[]
    ]
  )
}

const toNumberOrUndefined = (val: unknown): number | undefined => {
  if (val === '' || val === null || val === undefined) return undefined
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isNaN(n) ? undefined : n
}

export const buildValueValidator = (def: ConfigDefinition): z.ZodTypeAny => {
  if (def.inputType === 'number') {
    const n = applyNumberRules(z.number({ message: 'Bắt buộc nhập' }), def.validations)
    return z.preprocess(toNumberOrUndefined, def.required ? n : n.optional())
  }

  let base: z.ZodTypeAny

  switch (def.inputType) {
    case 'boolean':
    case 'switch':
      base = z.coerce.boolean()
      break

    case 'date':
      base = z.coerce.date()
      break

    case 'select': {
      // options are the source of truth: value must match one of option.value
      const values = (def.options ?? []).map((o) => o.value)
      base = literalUnion(values)
      break
    }

    case 'multiSelect': {
      // value is an array; each element must match one of option.value
      const values = (def.options ?? []).map((o) => o.value)
      let arr = z.array(literalUnion(values))
      if (def.required) arr = arr.min(1, 'Bắt buộc chọn ít nhất 1 giá trị')
      base = arr
      break
    }

    case 'json':
    case 'address':
      base = z.unknown()
      break

    case 'file': {
      let s = applyStringRules(z.string(), def.validations)
      if (def.required) s = s.min(1, 'Bắt buộc nhập')
      base = s
      break
    }

    case 'text':
    case 'textarea':
    default: {
      let s = applyStringRules(z.string(), def.validations)
      // required string without explicit minLength → force non-empty
      if (def.required && !def.validations.some((r) => 'minLength' in r)) {
        s = s.min(1, 'Bắt buộc nhập')
      }
      base = s
      break
    }
  }

  return def.required ? base : base.optional()
}

export const validateConfigValue = (
  def: ConfigDefinition
): { ok: true; value: unknown } | { ok: false; errors: string[] } => {
  const result = buildValueValidator(def).safeParse(def.value)
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, errors: result.error.issues.map((i) => i.message) }
}

// key must follow `group.sub_key` format and value.group must equal the key prefix
export const configExportSchema = z
  .object({
    key: z.string().max(200).regex(KEY_REGEX_STRICT, 'Key sai format group.sub_key'),
    isPublic: z.boolean(),
    value: configDefinitionSchema,
    group: z.string().min(2).max(100),
    kind: z.enum(ConfigKind)
  })
  .refine((c) => c.value.group === c.key.split('.')[0], {
    message: 'value.group phải khớp prefix của key',
    path: ['value', 'group']
  })
  .superRefine((data, ctx) => {
    const def = data.value as ConfigDefinition
    const result = buildValueValidator(def).safeParse(def.value)
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: 'custom', message: issue.message, path: ['value', 'value'] })
      }
    }
  })

export type CreateConfigFormInput = z.input<typeof configExportSchema>
export type CreateConfigFormValues = z.output<typeof configExportSchema>

export const defaultConfigFormValues: CreateConfigFormInput = {
  key: '',
  isPublic: false,
  group: '',
  kind: ConfigKind.content,
  value: {
    group: '',
    label: '',
    inputType: InputType.text,
    value: undefined,
    required: false,
    options: [],
    validations: []
  }
}

export const assertKeyGroupConsistent = (key: string, group: string): void => {
  const prefix = key.split('.')[0]

  if (prefix !== group) {
    throw new Error(`group "${group}" không khớp prefix key "${key}" (mong đợi "${prefix}")`)
  }
}

export const toExportJson = (key: string, def: ConfigDefinition): CreateConfigFormValues => {
  assertKeyGroupConsistent(key, def.group)

  return configExportSchema.parse({ key, value: def }) as CreateConfigFormValues
}

export const toExportBundle = (items: Array<{ key: string; def: ConfigDefinition }>): CreateConfigFormValues[] => {
  return items.map(({ key, def }) => toExportJson(key, def))
}

export const fromExportJson = (json: unknown): CreateConfigFormValues => {
  return configExportSchema.parse(json) as CreateConfigFormValues
}

const localizedTextSchema = z.object({
  vi: z.string(),
  en: z.string()
})

const productCollectionCampaignFormSchema = z.object({
  id: z.string(),
  campaignName: localizedTextSchema,
  skuPrefix: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  categoryIds: z.array(z.string()),
  badge: localizedTextSchema,
  enabled: z.boolean()
})

const productCollectionCardFormSchema = z.object({
  id: z.string(),
  image: z.string(),
  badge: localizedTextSchema,
  name: localizedTextSchema,
  description: localizedTextSchema,
  categoryIds: z.array(z.string()),
  enabled: z.boolean(),
  campaigns: z.array(productCollectionCampaignFormSchema)
})

export interface ProductCollectionSchemaOpts {
  takenSuffixes: Set<string>
  // On edit the suffix is locked; skip its validation.
  isEditing: boolean
}

export const productCollectionFormSchema = (t: TenantT, opts: ProductCollectionSchemaOpts) =>
  z
    .object({
      keySuffix: z.string(),
      label: z.string(),
      section: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
        enabled: z.boolean()
      }),
      hasCampaigns: z.boolean(),
      cards: z.array(productCollectionCardFormSchema)
    })
    .superRefine((data, ctx) => {
      if (!opts.isEditing) {
        const suffix = data.keySuffix.trim()
        if (!suffix) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.collectionKey.errors.required'),
            path: ['keySuffix']
          })
        } else if (!SLUG_REGEX.test(suffix)) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.collectionKey.errors.invalid'),
            path: ['keySuffix']
          })
        } else if (opts.takenSuffixes.has(suffix)) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.collectionKey.errors.duplicate'),
            path: ['keySuffix']
          })
        }
      }

      if (!data.section.title.vi.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.productCollectionDialog.errors.sectionTitleRequired'),
          path: ['section', 'title', 'vi']
        })
      }

      const seenSlugs = new Set<string>()
      data.cards.forEach((card, i) => {
        const slug = card.id.trim()
        if (!slug) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.productCollectionDialog.errors.slugRequired', { index: i + 1 }),
            path: ['cards', i, 'id']
          })
        } else if (!SLUG_REGEX.test(slug)) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.productCollectionDialog.errors.slugInvalid', { index: i + 1 }),
            path: ['cards', i, 'id']
          })
        } else if (seenSlugs.has(slug)) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.productCollectionDialog.errors.slugDuplicate', { slug }),
            path: ['cards', i, 'id']
          })
        }
        if (slug) seenSlugs.add(slug)

        if (!card.name.vi.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.productCollectionDialog.errors.nameRequired', { index: i + 1 }),
            path: ['cards', i, 'name', 'vi']
          })
        }

        if (!data.hasCampaigns) return

        const seenCampaignIds = new Set<string>()
        card.campaigns.forEach((ca, j) => {
          const cid = ca.id.trim()
          const ctxArgs = { cardIndex: i + 1, index: j + 1 }
          if (!cid) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignIdRequired', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'id']
            })
          } else if (!SLUG_REGEX.test(cid)) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignIdInvalid', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'id']
            })
          } else if (seenCampaignIds.has(cid)) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignIdDuplicate', { ...ctxArgs, id: cid }),
              path: ['cards', i, 'campaigns', j, 'id']
            })
          }
          if (cid) seenCampaignIds.add(cid)

          if (!ca.campaignName.vi.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignNameRequired', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'campaignName', 'vi']
            })
          }
          if (!ca.skuPrefix.trim()) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignSkuRequired', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'skuPrefix']
            })
          }
          if (!ca.startDate) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignDatesRequired', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'startDate']
            })
          }
          if (!ca.endDate) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignDatesRequired', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'endDate']
            })
          } else if (ca.startDate && ca.startDate > ca.endDate) {
            ctx.addIssue({
              code: 'custom',
              message: t('configsPage.productCollectionDialog.errors.campaignDatesInvalid', ctxArgs),
              path: ['cards', i, 'campaigns', j, 'endDate']
            })
          }
        })
      })
    })

export type ProductCollectionFormValues = z.infer<ReturnType<typeof productCollectionFormSchema>>

const feedbackItemFormSchema = z.object({
  _uid: z.string(),
  id: z.string(),
  customerName: z.string(),
  area: z.string(),
  content: localizedTextSchema,
  flowerType: z.string(),
  image: z.string(),
  postDate: z.string(),
  rating: z.number().optional(),
  featured: z.boolean(),
  isPlaceholder: z.boolean(),
  source: z.enum(FEEDBACK_SOURCES),
  sourceUrl: z.string()
})

export const feedbacksCollectionFormSchema = (t: TenantT) =>
  z
    .object({
      section: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
        enabled: z.boolean()
      }),
      items: z.array(feedbackItemFormSchema)
    })
    .superRefine((data, ctx) => {
      if (!data.section.title.vi.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.feedbacksDialog.errors.sectionTitleRequired'),
          path: ['section', 'title', 'vi']
        })
      }

      const featuredCount = data.items.filter((i) => i.featured).length
      if (featuredCount > MAX_FEATURED_FEEDBACKS) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.feedbacksDialog.errors.tooManyFeatured', { max: MAX_FEATURED_FEEDBACKS }),
          path: ['items']
        })
      }

      data.items.forEach((item, i) => {
        if (!item.customerName.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.feedbacksDialog.errors.nameRequired', { index: i + 1 }),
            path: ['items', i, 'customerName']
          })
        }
        if (!item.content.vi.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.feedbacksDialog.errors.contentRequired', { index: i + 1 }),
            path: ['items', i, 'content', 'vi']
          })
        }
        if (!item.postDate.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.feedbacksDialog.errors.postDateRequired', { index: i + 1 }),
            path: ['items', i, 'postDate']
          })
        }
      })
    })

export type FeedbacksCollectionFormValues = z.infer<ReturnType<typeof feedbacksCollectionFormSchema>>

const promotionCampaignFormSchema = z.object({
  id: z.string(),
  image: z.string(),
  href: z.string(),
  openInNewTab: z.boolean(),
  alt: localizedTextSchema,
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  enabled: z.boolean(),
  // `[]` inherits `section.pages`; a non-empty list replaces it.
  pages: z.array(z.string())
})

export const promotionPopupFormSchema = (t: TenantT) =>
  z
    .object({
      section: z.object({
        enabled: z.boolean(),
        frequency: z.enum(POPUP_FREQUENCIES),
        pages: z.array(z.string())
      }),
      items: z.array(promotionCampaignFormSchema)
    })
    .superRefine((data, ctx) => {
      // A bad pattern can't be reported by the storefront — it just silently changes where
      // the popup appears — so it is caught here instead.
      const invalidSectionPattern = data.section.pages.find((pattern) => !isValidPagePattern(pattern))
      if (invalidSectionPattern) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.promotionPopupDialog.errors.pagePatternInvalid', {
            pattern: invalidSectionPattern
          }),
          path: ['section', 'pages']
        })
      }

      data.items.forEach((item, i) => {
        const index = i + 1

        const invalidPattern = item.pages.find((pattern) => !isValidPagePattern(pattern))
        if (invalidPattern) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.promotionPopupDialog.errors.itemPagePatternInvalid', {
              index,
              pattern: invalidPattern
            }),
            path: ['items', i, 'pages']
          })
        }

        if (!item.alt.vi.trim()) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.promotionPopupDialog.errors.altRequired', { index }),
            path: ['items', i, 'alt', 'vi']
          })
        }

        if (!isSafeHref(item.href)) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.promotionPopupDialog.errors.hrefInvalid', { index }),
            path: ['items', i, 'href']
          })
        }

        const start = pickerValueToYmd(item.startDate)
        const end = pickerValueToYmd(item.endDate)
        if (start && end && start > end) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.promotionPopupDialog.errors.datesInvalid', { index }),
            path: ['items', i, 'endDate']
          })
        }
      })
    })

export type PromotionPopupFormValues = z.infer<ReturnType<typeof promotionPopupFormSchema>>

export function inputTypeToValueType(inputType: InputType): 'string' | 'number' | 'boolean' | 'json' | 'date' {
  switch (inputType) {
    case 'number':
      return 'number'
    case 'boolean':
    case 'switch':
      return 'boolean'
    case 'date':
      return 'date'
    case 'json':
    case 'address':
    case 'multiSelect':
      return 'json'
    case 'file':
      return 'string'
    default:
      return 'string' // text, textarea, select
  }
}
