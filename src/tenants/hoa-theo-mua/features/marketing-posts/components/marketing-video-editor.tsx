import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { getApiErrorDetail } from '../api-error'
import { marketingPostKeys } from '../query-keys'
import { publicationKeys } from '../publications/query-keys'
import MarketingPublicationPanel from '../publications/components/publication-panel'
import marketingPostService from '../services'
import { isLockedForEditingStatus, MarketingPostPlatform, type MarketingPostCoreDetail } from '../types'
import MarketingVideoUpload from './marketing-video-upload'
import { getInvalidHashtagTokens } from '../hashtags'

export default function MarketingVideoEditor({
  post,
  readOnly = false
}: {
  post: MarketingPostCoreDetail
  readOnly?: boolean
}) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const platform = post.platforms.find((item) => item.platform === MarketingPostPlatform.Zalo)
  const original = platform?.content
  const [title, setTitle] = useState(original?.title ?? post.title)
  const [content, setContent] = useState(original?.content ?? post.content)
  const [hashtag, setHashtag] = useState(original?.hashtag ?? post.hashtag ?? '')
  const [video, setVideo] = useState(post.video ?? null)
  const [uploading, setUploading] = useState(false)
  const locked = Boolean(platform && isLockedForEditingStatus(platform.status))
  const active =
    post.children?.some((child) => ['Scheduled', 'Queued', 'Publishing', 'NeedsReview'].includes(child.status)) ?? false
  const dirty =
    title !== (original?.title ?? post.title) ||
    content !== (original?.content ?? post.content) ||
    hashtag !== (original?.hashtag ?? post.hashtag ?? '') ||
    video?.url !== post.video?.url ||
    !platform
  const captionLength = [...[content.trim(), hashtag.trim()].filter(Boolean).join('\n\n')].length
  const valid = Boolean(
    video &&
    title.trim() &&
    [...title.trim()].length <= 150 &&
    content.trim() &&
    captionLength <= 300 &&
    getInvalidHashtagTokens(hashtag).length === 0
  )
  const save = useMutation({
    mutationFn: async () => {
      if (!valid || !video) throw new Error(t('marketingPosts.video.required'))
      let updated = post
      if (video.url !== post.video?.url) {
        updated = await marketingPostService.updateMarketingPost({
          id: post.basePostId,
          body: {
            title: post.title,
            content: post.content,
            hashtag: post.hashtag,
            images: [],
            video
          }
        })
      }
      if (!platform) updated = await marketingPostService.prepareVideoPost(post.basePostId)
      updated = await marketingPostService.updateMarketingContent({
        id: post.basePostId,
        platform: MarketingPostPlatform.Zalo,
        body: { title: title.trim(), content: content.trim(), hashtag: hashtag.trim() || null }
      })
      return updated
    },
    onSuccess: (updated) => {
      const saved = updated.platforms.find((item) => item.platform === MarketingPostPlatform.Zalo)?.content
      setTitle(saved?.title ?? title.trim())
      setContent(saved?.content ?? content.trim())
      setHashtag(saved?.hashtag ?? '')
      setVideo(updated.video ?? null)
      queryClient.setQueryData(marketingPostKeys.detail(post.basePostId), updated)
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.detail(post.basePostId) })
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      queryClient.invalidateQueries({ queryKey: publicationKeys.all })
      toast.success(t('marketingPosts.video.saved'))
    },
    onError: (error) => toast.error(t('marketingPosts.video.saveFailed'), { description: getApiErrorDetail(error) })
  })
  const busy = save.isPending || uploading
  const path = `/htm/ai-marketing/posts/${post.basePostId}`

  return (
    <div className='mx-auto max-w-5xl space-y-5 overflow-auto p-6'>
      <Button asChild variant='ghost' size='sm'>
        <Link to='/htm/ai-marketing/posts'>{t('marketingPosts.detail.back')}</Link>
      </Button>
      <div className='flex items-start justify-between gap-3'>
        <h1 className='text-2xl font-bold'>{post.title}</h1>
        {readOnly && !locked && (
          <Button asChild variant='outline'>
            <Link to={`${path}/update`}>{t('marketingPosts.video.edit')}</Link>
          </Button>
        )}
      </div>
      <p className='rounded-xl border bg-muted/30 p-3 text-sm'>{t('marketingPosts.video.postOnly')}</p>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <div className='space-y-4'>
          {readOnly ? (
            <video
              controls
              playsInline
              preload='metadata'
              src={post.video?.url}
              poster={post.video?.posterUrl}
              className='max-h-120 w-full rounded-xl bg-black'
            />
          ) : (
            <MarketingVideoUpload
              value={video}
              onChange={setVideo}
              disabled={locked || active || busy}
              onBusyChange={setUploading}
            />
          )}
          {!readOnly && active && (
            <p className='text-xs text-muted-foreground'>{t('marketingPosts.video.cancelBeforeReplace')}</p>
          )}
          <section className='space-y-3 rounded-xl border p-4'>
            <label className='block space-y-1 text-sm font-medium'>
              {t('marketingPosts.video.captionTitle')}
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={readOnly || locked || busy}
                maxLength={150}
              />
            </label>
            <label className='block space-y-1 text-sm font-medium'>
              {t('marketingPosts.video.caption')}
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                disabled={readOnly || locked || busy}
                rows={8}
              />
            </label>
            <label className='block space-y-1 text-sm font-medium'>
              {t('marketingPosts.video.hashtags')}
              <Input
                value={hashtag}
                onChange={(event) => setHashtag(event.target.value)}
                disabled={readOnly || locked || busy}
              />
            </label>
            <p className={captionLength > 300 ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
              {t('marketingPosts.video.captionLimit')} ({captionLength}/300)
            </p>
            {!readOnly && (
              <Button type='button' disabled={locked || busy || !valid || !dirty} onClick={() => save.mutate()}>
                {save.isPending && <Spinner />}
                {t('marketingPosts.video.save')}
              </Button>
            )}
          </section>
        </div>
        <section className='space-y-3 rounded-xl border p-4'>
          <h2 className='font-semibold'>{t('marketingPosts.channel.zaloOa')}</h2>
          {dirty && !readOnly && <p className='text-sm text-muted-foreground'>{t('marketingPosts.video.saveFirst')}</p>}
          {platform && (
            <MarketingPublicationPanel
              id={post.basePostId}
              platform={MarketingPostPlatform.Zalo}
              disabled={(!readOnly && dirty) || busy}
            />
          )}
        </section>
      </div>
    </div>
  )
}
