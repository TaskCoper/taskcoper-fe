import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUploadFile } from '@/hooks/use-upload-file'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { MarketingPostVideo } from '../types'
import { MARKETING_VIDEO_MAX_BYTES, prepareMarketingVideo } from '../video-upload'

export default function MarketingVideoUpload({
  value,
  onChange,
  disabled,
  onBusyChange
}: {
  value: MarketingPostVideo | null
  onChange: (video: MarketingPostVideo | null) => void
  disabled?: boolean
  onBusyChange?: (busy: boolean) => void
}) {
  const { t } = useTenantTranslation()
  const { uploadFileAsync } = useUploadFile({ onError: () => undefined })
  const abortRef = useRef<AbortController | null>(null)
  const [phase, setPhase] = useState<'preparing' | 'uploading' | 'cover' | null>(null)
  const [progress, setProgress] = useState(0)
  const busy = phase !== null
  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    []
  )

  const upload = async (files: File[]) => {
    const file = files[0]
    if (!file || abortRef.current) return
    const controller = new AbortController()
    abortRef.current = controller
    onBusyChange?.(true)
    setPhase('preparing')
    try {
      const poster = await prepareMarketingVideo(file, controller.signal)
      setPhase('uploading')
      setProgress(0)
      const url = await uploadFileAsync({ file, signal: controller.signal, onProgress: setProgress })
      controller.signal.throwIfAborted()
      setPhase('cover')
      const posterUrl = await uploadFileAsync({ file: poster, signal: controller.signal })
      controller.signal.throwIfAborted()
      if (!url || !posterUrl) throw new Error('uploadFailed')
      onChange({ url, fileName: file.name, posterUrl })
    } catch (error) {
      if (!controller.signal.aborted)
        toast.error(
          t(
            error instanceof Error && error.message === 'invalidVideo'
              ? 'marketingPosts.video.invalidVideo'
              : 'marketingPosts.video.uploadFailed'
          )
        )
    } finally {
      abortRef.current = null
      setPhase(null)
      onBusyChange?.(false)
    }
  }
  return (
    <section className='space-y-3 rounded-xl border p-4'>
      <h2 className='font-medium'>{t('marketingPosts.video.title')}</h2>
      <p className='text-xs text-muted-foreground'>{t('marketingPosts.video.limits')}</p>
      {value && (
        <>
          <video
            src={value.url}
            poster={value.posterUrl}
            controls
            playsInline
            preload='metadata'
            className='max-h-96 w-full rounded-lg bg-black'
          />
          <p className='truncate text-sm'>{value.fileName}</p>
          <Button type='button' variant='outline' size='sm' disabled={disabled || busy} onClick={() => onChange(null)}>
            {t('marketingPosts.video.remove')}
          </Button>
        </>
      )}
      <FileDropzone
        accept={{ 'video/mp4': ['.mp4'] }}
        maxSize={MARKETING_VIDEO_MAX_BYTES}
        disabled={disabled || busy}
        onFilesChange={upload}
        className='rounded-xl border border-dashed p-6 text-center'
      >
        <p className='text-sm'>{t(value ? 'marketingPosts.video.replace' : 'marketingPosts.video.choose')}</p>
      </FileDropzone>
      {phase && (
        <div className='flex items-center gap-2 text-sm' role='status' aria-live='polite'>
          <Spinner />
          {t(`marketingPosts.video.phase.${phase}`, { progress })}
          <Button type='button' variant='outline' size='sm' onClick={() => abortRef.current?.abort()}>
            {t('marketingPosts.video.cancel')}
          </Button>
        </div>
      )}
    </section>
  )
}
