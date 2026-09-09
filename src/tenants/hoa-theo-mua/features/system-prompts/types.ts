export const SystemPromptType = {
  Flower: 1,
  Card: 2,
  Post: 3
} as const

export type SystemPromptType = (typeof SystemPromptType)[keyof typeof SystemPromptType]

export interface SystemPromptSummary {
  id: string
  type: SystemPromptType
}

export interface SystemPromptDetail extends SystemPromptSummary {
  content: string
}

export interface UpdateSystemPromptBody {
  content: string
}
