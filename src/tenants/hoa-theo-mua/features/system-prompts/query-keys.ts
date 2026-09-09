export const systemPromptKeys = {
  all: ['system-prompts'] as const,
  list: () => [...systemPromptKeys.all, 'list'] as const,
  detail: (id: string) => [...systemPromptKeys.all, 'detail', id] as const
}
