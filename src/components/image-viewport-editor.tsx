import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import {
  clampImageViewport,
  decodeImageViewport,
  encodeImageViewport,
  isFullFrameViewport,
  type ImageViewport
} from '@/lib/image-viewport'
import { setStagedViewport, useStagedUpload } from '@/lib/staged-uploads'
import { CropIcon } from 'lucide-react'
import { useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'

const DEFAULT_MIN_ZOOM = 1
const DEFAULT_MAX_ZOOM = 5

type ViewportCropperProps = {
  src: string
  aspectRatio: number
  initialViewport: ImageViewport | null
  minZoom: number
  maxZoom: number
  onSave: (viewport: ImageViewport | null) => void
  onCancel: () => void
}

/**
 * The editing surface. Split out from the dialog so it mounts fresh each time the dialog opens,
 * which resets crop and zoom without any teardown logic.
 */
function ViewportCropper({
  src,
  aspectRatio,
  initialViewport,
  minZoom,
  maxZoom,
  onSave,
  onCancel
}: ViewportCropperProps) {
  const { t } = useTenantTranslation()

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(minZoom)
  const [viewport, setViewport] = useState<ImageViewport | null>(initialViewport)

  // Captured once: a changing identity would yank the frame out from under a drag in progress.
  const [initialArea] = useState<Area | undefined>(() =>
    initialViewport
      ? { x: initialViewport.x, y: initialViewport.y, width: initialViewport.w, height: initialViewport.h }
      : undefined
  )

  return (
    <>
      <div className='relative h-[55vh] max-h-96 w-full overflow-hidden rounded-lg bg-muted'>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          minZoom={minZoom}
          maxZoom={maxZoom}
          objectFit='contain'
          restrictPosition
          showGrid
          // The dialog body scrolls, so wheel-zoom would fight it.
          zoomWithScroll={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(area) =>
            setViewport(clampImageViewport({ x: area.x, y: area.y, w: area.width, h: area.height }))
          }
          initialCroppedAreaPercentages={initialArea}
        />
      </div>

      <div className='flex items-center gap-3'>
        <span className='text-xs text-muted-foreground shrink-0'>{t('imageViewport.zoom')}</span>
        <Slider
          min={minZoom}
          max={maxZoom}
          step={0.01}
          value={[zoom]}
          onValueChange={([next]) => setZoom(next)}
          aria-label={t('imageViewport.zoom')}
        />
      </div>

      <DialogFooter className='sm:justify-between'>
        <Button type='button' variant='ghost' size='sm' onClick={() => onSave(null)}>
          {t('imageViewport.useFullImage')}
        </Button>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel}>
            {t('common.button.cancel')}
          </Button>
          <Button type='button' size='sm' onClick={() => onSave(isFullFrameViewport(viewport) ? null : viewport)}>
            {t('common.button.save')}
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

export type ImageViewportEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Any renderable image URL, including `blob:`. Any `#iv=` fragment is stripped internally. */
  src: string
  aspectRatio: number
  initialViewport?: ImageViewport | null
  minZoom?: number
  maxZoom?: number
  /** `null` means "show the whole image" - the same state as an image that was never framed. */
  onSave: (viewport: ImageViewport | null) => void
}

/**
 * Lets a content editor choose which part of an image is visible in a given slot.
 *
 * No cropped copy is produced - the result is a viewport applied with CSS at render time. Callers
 * supply `aspectRatio` because only they know the box the image will render into.
 */
export function ImageViewportEditorDialog({
  open,
  onOpenChange,
  src,
  aspectRatio,
  initialViewport = null,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  onSave
}: ImageViewportEditorDialogProps) {
  const { t } = useTenantTranslation()

  const handleSave = (viewport: ImageViewport | null) => {
    onSave(viewport)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('imageViewport.adjust')}</DialogTitle>
          <DialogDescription>{t('imageViewport.description')}</DialogDescription>
        </DialogHeader>
        <ViewportCropper
          src={decodeImageViewport(src).src}
          aspectRatio={aspectRatio}
          initialViewport={initialViewport}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export type ImageViewportButtonProps = {
  /** The image to frame. May be a `blob:` preview of a file that has not been uploaded yet. */
  src: string
  viewport: ImageViewport | null
  onViewportChange: (viewport: ImageViewport | null) => void
  aspectRatio: number
  disabled?: boolean
  size?: 'sm' | 'icon-sm'
  className?: string
}

/**
 * Opens the editor for an image whose URL and framing are held separately.
 *
 * The primitive the URL-based wrapper builds on: a staged file's `blob:` URL can't carry a
 * framing, so that lives in component state until upload gives it a durable address.
 */
export function ImageViewportButton({
  src,
  viewport,
  onViewportChange,
  aspectRatio,
  disabled,
  size = 'sm',
  className
}: ImageViewportButtonProps) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = useState(false)

  if (!src) return null

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size={size}
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={t('imageViewport.adjust')}
        className={className}
      >
        <CropIcon data-icon={size === 'sm' ? 'inline-start' : undefined} />
        {size === 'sm' && t('imageViewport.adjust')}
      </Button>
      {open && (
        <ImageViewportEditorDialog
          open={open}
          onOpenChange={setOpen}
          src={src}
          aspectRatio={aspectRatio}
          initialViewport={viewport}
          onSave={onViewportChange}
        />
      )}
    </>
  )
}

export type ImageViewportUrlButtonProps = {
  /** A stored image value; the framing is read from and written back into its fragment. */
  value: string
  onChange: (next: string) => void
  aspectRatio: number
  disabled?: boolean
  size?: 'sm' | 'icon-sm'
  className?: string
}

/** Opens the editor for an image already stored as a URL, round-tripping through its fragment. */
export function ImageViewportUrlButton({ value, onChange, aspectRatio, ...rest }: ImageViewportUrlButtonProps) {
  const staged = useStagedUpload(value)
  const decoded = decodeImageViewport(value)

  // A staged file has no durable URL to carry a framing, so its viewport lives in the registry until upload.
  return (
    <ImageViewportButton
      src={staged ? value : decoded.src}
      viewport={staged ? staged.viewport : decoded.viewport}
      onViewportChange={(next) =>
        staged ? setStagedViewport(value, next) : onChange(encodeImageViewport(value, next))
      }
      aspectRatio={aspectRatio}
      {...rest}
    />
  )
}
