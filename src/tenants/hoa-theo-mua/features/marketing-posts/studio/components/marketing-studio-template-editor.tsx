import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import MarketingPostTemplatePicker from '../../components/marketing-post-template-picker'
import { getImageTemplates, templatePairs, type MarketingTemplateSelection } from '../../image-templates'
import { getApiErrorDetail } from '../../api-error'
import { marketingPostKeys } from '../../query-keys'
import { publicationKeys } from '../../publications/query-keys'
import marketingPostService from '../../services'
import type { MarketingPostCoreDetail, MarketingPostPlatformDetail, MarketingPostImageSlot } from '../../types'

export default function MarketingStudioTemplateEditor({
  post,
  platform,
  disabled
}: {
  post: MarketingPostCoreDetail
  platform: MarketingPostPlatformDetail
  disabled: boolean
}) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const initial: MarketingTemplateSelection | null = platform.imageTemplateId
    ? { templateId: platform.imageTemplateId, sourceImageIds: platform.templateImageIds ?? [] }
    : null
  const [value, setValue] = useState(initial)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const apply = useMutation({
    mutationFn: async (selection: MarketingTemplateSelection | null) => {
      let images: MarketingPostImageSlot[] = platform.images.map((image) => ({ ...image }))
      if (selection) {
        const template = (await getImageTemplates()).find(
          (item) => item.id === selection.templateId && item.platform === platform.platform && item.canApply
        )
        if (
          !template ||
          selection.sourceImageIds.length !== template.ratios.length ||
          selection.sourceImageIds.some((id) => !id)
        ) {
          throw new Error(t('marketingPosts.templates.missing'))
        }
        const history = await marketingPostService.getMarketingImageHistory({ id: post.basePostId })
        images = []
        const pairs = templatePairs(template, selection)
        for (const [index, pair] of pairs.entries()) {
          setProgress({ current: index + 1, total: pairs.length })
          const chosen = platform.images.find(
            (item) => item.sourceBasePostImageId === pair.imageId && item.ratioCode === pair.ratioCode
          )
          let imageId =
            chosen?.selectedGeneratedPostImageId ??
            history.groups
              .find((group) => group.sourceBasePostImageId === pair.imageId && group.ratioCode === pair.ratioCode)
              ?.versions.filter((version) => version.status === 'Succeeded' && version.imageUrl)
              .at(-1)?.generatedPostImageId
          if (!imageId) {
            const generated = await marketingPostService.regenerateMarketingImage({
              id: post.basePostId,
              body: {
                sourceBasePostImageId: pair.imageId,
                ratioCode: pair.ratioCode
              }
            })
            if (generated.status !== 'Succeeded' || !generated.imageUrl)
              throw new Error(t('marketingPosts.templates.cropFailed'))
            imageId = generated.generatedPostImageId
          }
          images.push({
            sourceBasePostImageId: pair.imageId,
            ratioCode: pair.ratioCode,
            selectedGeneratedPostImageId: imageId,
            sortOrder: pair.sortOrder
          })
        }
      }
      return marketingPostService.updateMarketingPlatformImages({
        id: post.basePostId,
        platform: platform.platform,
        imageTemplateId: selection?.templateId ?? null,
        images
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(marketingPostKeys.detail(post.basePostId), updated)
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.detail(post.basePostId) })
      queryClient.invalidateQueries({ queryKey: publicationKeys.all })
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      toast.success(t('marketingPosts.templates.saved'))
    },
    onError: (error) => {
      setValue(initial)
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.detail(post.basePostId) })
      toast.error(t('marketingPosts.templates.saveError'), {
        description: error instanceof Error ? error.message : getApiErrorDetail(error)
      })
    },
    onSettled: () => setProgress(null)
  })
  const valid = value?.templateId && value.sourceImageIds.length > 0 && value.sourceImageIds.every(Boolean)

  return (
    <div className='space-y-2'>
      <MarketingPostTemplatePicker
        platform={platform.platform}
        images={post.baseImages}
        value={value}
        disabled={disabled || apply.isPending}
        onChange={(next) => {
          setValue(next)
          if (next === null && platform.imageTemplateId) apply.mutate(null)
        }}
      />
      {value && (
        <>
          <p className='text-xs text-muted-foreground'>{t('marketingPosts.templates.applyHint')}</p>
          <Button type='button' disabled={disabled || apply.isPending || !valid} onClick={() => apply.mutate(value)}>
            {apply.isPending && <Spinner />}
            {progress ? t('marketingPosts.templates.progress', progress) : t('marketingPosts.templates.apply')}
          </Button>
        </>
      )}
    </div>
  )
}
