import { emptyLocalizedText, parseLocalizedText, safeJsonParse, type LocalizedText } from './palette-shared'

export const AI_CUSTOM_SIZE_CONFIG_GROUP = 'ai_custom'
export const AI_CUSTOM_SIZE_CONFIG_KEY = 'ai_custom.size_config'

export interface AiCustomSize {
  name: string
  description: string | null
  comboQuantity: number
  isActive: boolean
  isDelete: boolean
}

export interface AiCustomSizeSection {
  enabled: boolean
  title: LocalizedText
  description: LocalizedText
}

export const defaultAiCustomSizeSection = (): AiCustomSizeSection => ({
  enabled: true,
  title: emptyLocalizedText(),
  description: emptyLocalizedText()
})

export const isAiCustomSizeConfig = (key: string | null | undefined) => key === AI_CUSTOM_SIZE_CONFIG_KEY

export const defaultAiCustomSize = (): AiCustomSize => ({
  name: '',
  description: null,
  comboQuantity: 1,
  isActive: true,
  isDelete: false
})

export const parseAiCustomSizes = (raw: unknown): AiCustomSize[] => {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
  const values = Array.isArray(parsed) ? parsed : ((parsed as { items?: unknown } | null)?.items ?? [])
  if (!Array.isArray(values)) return []

  return values
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name : '',
      description: typeof item.description === 'string' ? item.description : null,
      comboQuantity: typeof item.comboQuantity === 'number' ? item.comboQuantity : Number(item.comboQuantity) || 0,
      isActive: item.isActive !== false,
      isDelete: item.isDelete === true
    }))
}

export const parseAiCustomSizeSection = (raw: unknown): AiCustomSizeSection => {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
  const section =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>).section
      : undefined
  if (!section || typeof section !== 'object' || Array.isArray(section)) return defaultAiCustomSizeSection()

  const sectionRecord = section as Partial<AiCustomSizeSection>
  return {
    enabled: sectionRecord.enabled !== false,
    title: parseLocalizedText(sectionRecord.title),
    description: parseLocalizedText(sectionRecord.description)
  }
}
