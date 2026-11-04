import { useCallback, useRef, useState } from 'react'
import type { MarketingPostChannel, MarketingPostCoreDetail, MarketingPostImageSlot } from '../types'
import type { MarketingStudioCaptionEdit } from './types'
import { channelPlatforms } from '../platform-channels'

export interface PostChannelEdit {
  expectedRevision: string
  generationId?: string
  content?: MarketingStudioCaptionEdit
  images?: { imageTemplateId: string | null; images: MarketingPostImageSlot[] }
}

export function usePostEditDraft(post: MarketingPostCoreDetail | undefined) {
  const [edits, setEdits] = useState<Partial<Record<MarketingPostChannel, PostChannelEdit>>>({})
  const editsRef = useRef(edits)
  const stage = useCallback(
    (channel: MarketingPostChannel, patch: Partial<PostChannelEdit>) => {
      const previous = editsRef.current[channel]
      const next = {
        ...editsRef.current,
        [channel]: {
          expectedRevision:
            post?.platforms.find((item) => item.platform === channelPlatforms[channel])?.editRevision ?? '',
          ...previous,
          ...patch
        }
      }
      if (next[channel] && !next[channel].content && !next[channel].images && !next[channel].generationId)
        delete next[channel]
      editsRef.current = next
      setEdits(next)
    },
    [post]
  )
  const clear = useCallback(() => {
    editsRef.current = {}
    setEdits({})
  }, [])
  const read = useCallback(
    () =>
      Object.entries(editsRef.current).map(([channel, edit]) => ({
        platform: channelPlatforms[channel as MarketingPostChannel],
        expectedRevision: edit.expectedRevision,
        generationId: edit.generationId,
        content: edit.content
          ? {
              title: edit.content.title?.trim() || null,
              content: edit.content.content,
              hashtag: edit.content.hashtags.join(' ') || null
            }
          : undefined,
        images: edit.images
      })),
    []
  )
  return { edits, stage, clear, read, isDirty: Object.keys(edits).length > 0 }
}
