import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { formatBytes } from '@/features/projects/resources/utils'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { DownloadIcon, FileSpreadsheetIcon, SparklesIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useImportMarketingPlan } from '../hooks/use-import-marketing-plan'
import { MARKETING_PLAN_FILE_MAX_SIZE, MARKETING_PLAN_FILE_TYPES, MARKETING_PLAN_TEMPLATE_URL } from '../validations'

// Chỉ nhận file rồi đẩy lên. Đọc từng dòng kế hoạch và cho AI sinh bài là việc của backend,
// nên màn hình không xem trước hay soát nội dung file.
export default function MarketingPlanImportDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTenantTranslation()
  const [file, setFile] = useState<File | null>(null)
  const { importMarketingPlan, isImportingMarketingPlan } = useImportMarketingPlan()

  const handleOpenChange = (nextOpen: boolean) => {
    // Đang đẩy file thì không cho đóng, không thì admin tưởng đã huỷ trong khi server vẫn nhận
    if (isImportingMarketingPlan) return
    if (!nextOpen) setFile(null)
    onOpenChange(nextOpen)
  }

  const handleSubmit = async () => {
    if (!file) return

    try {
      await importMarketingPlan({ file })
      setFile(null)
      onOpenChange(false)
    } catch {
      // Hook đã báo lỗi; giữ dialog và file để admin bấm lại
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='w-[calc(100%-2rem)] min-w-0 sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('marketingPosts.planImport.title')}</DialogTitle>
          <DialogDescription>{t('marketingPosts.planImport.description')}</DialogDescription>
        </DialogHeader>

        {file ? (
          <div className='flex items-center gap-3 rounded-xl border bg-muted/30 p-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'>
              <FileSpreadsheetIcon className='size-5' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{file.name}</p>
              <p className='text-xs text-muted-foreground'>{formatBytes(file.size)}</p>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              disabled={isImportingMarketingPlan}
              onClick={() => setFile(null)}
              aria-label={t('marketingPosts.planImport.remove')}
            >
              <XIcon className='size-4' />
            </Button>
          </div>
        ) : (
          <FileDropzone
            value={null}
            onFileChange={setFile}
            accept={MARKETING_PLAN_FILE_TYPES}
            maxSize={MARKETING_PLAN_FILE_MAX_SIZE}
            className='rounded-xl'
          >
            {({ isDragActive }) => (
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:bg-muted/40',
                  isDragActive && 'border-primary bg-primary/5'
                )}
              >
                <UploadCloudIcon className='size-8 text-muted-foreground' />
                <p className='text-sm font-medium'>{t('marketingPosts.planImport.dropzone')}</p>
                <p className='text-xs text-muted-foreground'>
                  {t('marketingPosts.planImport.dropzoneHint', {
                    size: formatBytes(MARKETING_PLAN_FILE_MAX_SIZE)
                  })}
                </p>
              </div>
            )}
          </FileDropzone>
        )}

        <div className='flex flex-wrap items-center justify-between gap-2'>
          <p className='text-xs text-muted-foreground'>{t('marketingPosts.planImport.templateHint')}</p>
          <Button type='button' variant='link' size='sm' asChild className='h-auto p-0'>
            <a href={MARKETING_PLAN_TEMPLATE_URL} download>
              <DownloadIcon />
              {t('marketingPosts.planImport.downloadTemplate')}
            </a>
          </Button>
        </div>

        <p className='text-xs text-muted-foreground'>{t('marketingPosts.planImport.note')}</p>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={isImportingMarketingPlan}
            onClick={() => handleOpenChange(false)}
          >
            {t('common.button.cancel')}
          </Button>
          <Button type='button' disabled={!file || isImportingMarketingPlan} onClick={handleSubmit}>
            {isImportingMarketingPlan ? <Spinner /> : <SparklesIcon />}
            {t('marketingPosts.planImport.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
