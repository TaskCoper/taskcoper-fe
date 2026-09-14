export const SystemPromptType = {
  Flower: 0,
  Card: 1,
  Post: 2,
  PlatformRule: 3,
  ImageToImage: 4
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
