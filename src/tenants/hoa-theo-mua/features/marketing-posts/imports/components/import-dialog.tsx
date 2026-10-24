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
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DownloadIcon, FileSpreadsheetIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import { marketingPostKeys } from '../../query-keys'
import { MARKETING_PLAN_FILE_MAX_SIZE, MARKETING_PLAN_FILE_TYPES, MARKETING_PLAN_TEMPLATE_URL } from '../../validations'
import { importRequestError } from '../error'
import service from '../services'
import { importKeys } from '../types'
import ImportDefaults from './import-defaults'

export default function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTenantTranslation()
  const client = useQueryClient()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [defaultsDirty, setDefaultsDirty] = useState(false)
  const requestKey = useRef<string | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const settings = useQuery({
    queryKey: importKeys.defaults,
    queryFn: service.defaults,
    enabled: open,
    throwOnError: false
  })
  const upload = useMutation({
    mutationFn: service.import,
    retry: false,
    onSuccess: (batch) => {
      client.invalidateQueries({ queryKey: importKeys.list })
      client.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      if (!mounted.current) return
      setFile(null)
      requestKey.current = null
      setProgress(null)
      onOpenChange(false)
      toast.success(t('marketingPosts.bulkImport.accepted'))
      navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts?marketingPostsView=imports&importBatch=${batch.id}`)
    }
  })
  const changeFile = (value: File | null) => {
    setFile(value)
    requestKey.current = value ? crypto.randomUUID() : null
    setProgress(null)
    upload.reset()
  }
  const close = (value: boolean) => {
    if (upload.isPending) return
    if (!value) {
      changeFile(null)
      setDefaultsDirty(false)
    }
    onOpenChange(value)
  }
  const submit = () => {
    if (!file || !requestKey.current || defaultsDirty) return
    setProgress(null)
    upload.mutate({ file, requestKey: requestKey.current, onProgress: setProgress })
  }
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className='max-h-[90dvh] w-[calc(100%-2rem)] min-w-0 overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('marketingPosts.bulkImport.title')}</DialogTitle>
          <DialogDescription>{t('marketingPosts.bulkImport.description')}</DialogDescription>
        </DialogHeader>
        <ImportDefaults disabled={upload.isPending} onDirtyChange={setDefaultsDirty} />
        <div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
          <span className='text-muted-foreground'>{t('marketingPosts.bulkImport.templateHint')}</span>
          <Button variant='link' size='sm' asChild className='h-auto p-0'>
            <a href={MARKETING_PLAN_TEMPLATE_URL} download>
              <DownloadIcon />
              {t('marketingPosts.bulkImport.template')}
            </a>
          </Button>
        </div>
        {file ? (
          <div className='flex min-w-0 items-center gap-3 rounded-xl border bg-muted/20 p-3'>
            <FileSpreadsheetIcon className='size-7 shrink-0 text-emerald-600' />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium'>{file.name}</p>
              <p className='text-xs text-muted-foreground'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              disabled={upload.isPending}
              onClick={() => changeFile(null)}
              aria-label={t('marketingPosts.bulkImport.removeFile')}
            >
              <XIcon />
            </Button>
          </div>
        ) : (
          <FileDropzone
            value={null}
            onFileChange={changeFile}
            accept={MARKETING_PLAN_FILE_TYPES}
            maxSize={MARKETING_PLAN_FILE_MAX_SIZE}
          >
            {() => (
              <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center'>
                <UploadCloudIcon className='size-8 text-primary' />
                <p className='text-sm font-medium'>{t('marketingPosts.bulkImport.dropzone')}</p>
                <p className='text-xs text-muted-foreground'>{t('marketingPosts.bulkImport.fileHint')}</p>
              </div>
            )}
          </FileDropzone>
        )}
        <p className='text-xs text-muted-foreground'>{t('marketingPosts.bulkImport.publishHint')}</p>
        {settings.data?.accounts.length === 0 && (
          <p className='text-xs text-amber-700 dark:text-amber-300'>
            {t('marketingPosts.bulkImport.defaults.required')}
          </p>
        )}
        {upload.isPending && (
          <p role='status' className='flex items-center gap-2 text-sm'>
            <Spinner />
            {progress === 100
              ? t('marketingPosts.bulkImport.validating')
              : progress === null
                ? t('marketingPosts.bulkImport.uploading')
                : t('marketingPosts.bulkImport.uploadPercent', { percent: progress })}
          </p>
        )}
        {upload.isError && (
          <p role='alert' className='rounded-lg border border-destructive/30 p-3 text-sm text-destructive'>
            {importRequestError(upload.error, t)}
          </p>
        )}
        <DialogFooter>
          <Button type='button' variant='outline' disabled={upload.isPending} onClick={() => close(false)}>
            {t('common.button.cancel')}
          </Button>
          <Button
            type='button'
            disabled={!file || upload.isPending || settings.isLoading || settings.isError || defaultsDirty}
            onClick={submit}
          >
            {upload.isPending ? <Spinner /> : <UploadCloudIcon />}
            {t('marketingPosts.bulkImport.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
