import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { z } from 'zod'

export const SYSTEM_PROMPT_MAX_LENGTH = 20_000

const hasForbiddenControlCharacter = (content: string) =>
  Array.from(content).some((character) => {
    const code = character.charCodeAt(0)
    return code === 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13)
  })

export const systemPromptSchema = (t: TenantT) =>
  z.object({
    content: z
      .string()
      .refine((content) => content.trim().length > 0, t('systemPrompts.validation.required'))
      .max(SYSTEM_PROMPT_MAX_LENGTH, t('systemPrompts.validation.maxLength', { count: SYSTEM_PROMPT_MAX_LENGTH }))
      .refine((content) => !hasForbiddenControlCharacter(content), t('systemPrompts.validation.controlCharacter'))
  })

export type SystemPromptFormValues = z.infer<ReturnType<typeof systemPromptSchema>>
