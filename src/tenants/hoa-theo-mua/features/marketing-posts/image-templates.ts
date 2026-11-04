import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { MarketingPostRatioCode, type MarketingPostChannel } from './types'
import { marketingPostRatiosByCode } from './image-ratios'

const templateSchema = z.object({
  id: z.string(),
  platform: z.enum(['facebook', 'instagram', 'zalo']),
  family: z.enum(['single', 'album', 'carousel', 'portraitLead', 'landscapeLead', 'article', 'collection']),
  ratios: z.array(z.enum(MarketingPostRatioCode)).min(1).max(10),
  canApply: z.boolean(),
  unavailableReason: z.string().nullable(),
  sourceUrl: z.url(),
  reviewedAt: z.string()
})

export type MarketingImageTemplate = z.infer<typeof templateSchema>
export interface MarketingTemplateSelection {
  templateId: string
  sourceImageIds: string[]
}
export type MarketingTemplateSelections = Partial<Record<MarketingPostChannel, MarketingTemplateSelection>>

export const getImageTemplates = async () => {
  const { data } = await api.get('/ecommerce-api/v1/posts/image-templates')
  return z.object({ value: z.array(templateSchema) }).parse(data).value
}

export const useImageTemplates = () =>
  useQuery({
    queryKey: ['marketing-posts', 'image-templates'],
    queryFn: getImageTemplates,
    staleTime: 300_000
  })

export const templatePairs = (template: MarketingImageTemplate, selection: MarketingTemplateSelection) =>
  template.ratios.map((ratioCode, index) => ({
    imageId: selection.sourceImageIds[index],
    ratioCode,
    ratio: marketingPostRatiosByCode[ratioCode],
    sortOrder: index + 1
  }))

// A replacement swaps source assignments; slot ratios and publication order stay fixed.
export const assignTemplateSource = (ids: string[], index: number, sourceId: string) => {
  const result = [...ids]
  const previous = result[index] ?? ''
  const existing = result.indexOf(sourceId)
  if (sourceId && existing !== -1 && existing !== index) result[existing] = previous
  result[index] = sourceId
  return result
}
