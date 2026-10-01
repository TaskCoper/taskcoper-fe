import FileDropzone from '@/components/file-dropzone'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ImagePlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { marketingPostImageRatios, type MarketingPostImageRatio } from '../../image-ratios'
import type { CreateMarketingPostImage } from '../../types'
import MarketingPostRatioPicker from '../../components/marketing-post-ratio-picker'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024

// Tải thêm ảnh gốc mà không phải quay lại bước tạo bài. Tỉ lệ chọn ở đây áp cho cả mẻ vừa thả vào,
// muốn thêm tỉ lệ cho riêng một ảnh thì dùng nút "Cắt thêm tỉ lệ".
const MarketingStudioImageAdder = ({
  isBusy,
  onAddSourceImages
}: {
  isBusy: boolean
  onAddSourceImages: (images: CreateMarketingPostImage[]) => void
}) => {
  const { t } = useTenantTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [ratios, setRatios] = useState<MarketingPostImageRatio[]>([marketingPostImageRatios[0]])
  // Backend chỉ nhận URL tuyệt đối nên ảnh phải lên storage trước khi thêm vào bài
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()

  const addFiles = async (files: File[]) => {
    if (files.length === 0 || ratios.length === 0) return

    const uploaded: CreateMarketingPostImage[] = []

    for (const file of files) {
      const url = await uploadFileWithToast({ file, loadingDescription: file.name, showSuccessToast: false })

      if (!url) continue

      uploaded.push({ url, name: file.name, ratios: [...ratios] })
    }

    if (uploaded.length > 0) onAddSourceImages(uploaded)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm' disabled={isBusy} className='h-7 px-2 text-xs'>
          <ImagePlusIcon className='size-3' />
          {t('marketingPosts.studio.imageAdder.add')}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='start' className='w-80 space-y-3'>
        <div>
          <p className='text-sm font-medium'>{t('marketingPosts.studio.imageAdder.title')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>{t('marketingPosts.studio.imageAdder.hint')}</p>
        </div>

        <div className='space-y-1.5'>
          <p className='text-xs font-medium'>{t('marketingPosts.studio.imageAdder.ratios')}</p>
          <MarketingPostRatioPicker value={ratios} onChange={setRatios} />
          {ratios.length === 0 && (
            <p className='text-xs text-destructive'>{t('marketingPosts.validation.images.ratioRequired')}</p>
          )}
        </div>

        <FileDropzone
          multiple
          accept={{ 'image/*': [] }}
          maxSize={MAX_IMAGE_SIZE}
          disabled={isUploading || isBusy}
          onFilesChange={addFiles}
          className='rounded-xl border border-dashed bg-muted/20 hover:bg-muted/40'
        >
          <div className='flex flex-col items-center justify-center gap-1.5 p-5 text-center'>
            {isUploading ? (
              <Spinner className='size-5 text-muted-foreground' />
            ) : (
              <ImagePlusIcon className='size-5 text-muted-foreground' />
            )}
            <p className='text-xs font-medium'>{t('marketingPosts.create.field.imagesPlaceholder')}</p>
            <p className='text-[0.7rem] text-muted-foreground'>{t('marketingPosts.create.field.imagesSizeHint')}</p>
          </div>
        </FileDropzone>
      </PopoverContent>
    </Popover>
  )
}

export default MarketingStudioImageAdder
