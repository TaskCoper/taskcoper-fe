import z from 'zod'
import { InputType, type ConfigDefinition, type ValidationRule } from './types'

const KEY_REGEX_STRICT = /^[a-z][a-z0-9]*(_[a-z0-9]+)*(\.[a-z][a-z0-9]*(_[a-z0-9]+)*)+$/

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
      'json',
      'image',
      'address'
    ]),
    value: z.unknown(),
    description: z.string().max(500).optional(),
    required: z.boolean(),
    options: z.array(inputOptionSchema).optional(),
    validations: z.array(validationRuleSchema).default([])
  })
  .refine((d) => d.inputType !== 'select' || (d.options?.length ?? 0) > 0, {
    message: "inputType 'select' phải có ít nhất 1 option",
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

export const buildValueValidator = (def: ConfigDefinition): z.ZodTypeAny => {
  let base: z.ZodTypeAny

  switch (def.inputType) {
    case 'number':
      base = applyNumberRules(z.coerce.number(), def.validations)
      break

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

    case 'json':
    case 'address':
      base = z.unknown()
      break

    case 'image': {
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
    value: configDefinitionSchema
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
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message, path: ['value', 'value'] })
      }
    }
  })

export type CreateConfigFormInput = z.input<typeof configExportSchema>
export type CreateConfigFormValues = z.output<typeof configExportSchema>

// Shared blank state for both create and update forms
export const defaultConfigFormValues: CreateConfigFormInput = {
  key: '',
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

// ─── Import / export helpers (for future JSON import/export feature) ──────────

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
      return 'json'
    case 'image':
      return 'string'
    default:
      return 'string' // text, textarea, select
  }
}
