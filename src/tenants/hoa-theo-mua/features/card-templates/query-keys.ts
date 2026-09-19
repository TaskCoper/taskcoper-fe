import type { GetCardTemplatesParams } from './types'

export const cardTemplateKeys = {
  all: ['card-templates'] as const,
  lists: () => [...cardTemplateKeys.all, 'list'] as const,
  list: (params: GetCardTemplatesParams) => [...cardTemplateKeys.lists(), params] as const
}
