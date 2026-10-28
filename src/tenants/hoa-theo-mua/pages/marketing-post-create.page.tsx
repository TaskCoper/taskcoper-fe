import MarketingVideoUpload from '../features/marketing-posts/components/marketing-video-upload'
import { useWatch } from 'react-hook-form'
import FileDropzone from '@/components/file-dropzone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ArrowLeftIcon, FileSpreadsheetIcon, ImagePlusIcon, XIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Controller } from 'react-hook-form'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import MarketingPlanImportDialog from '../features/marketing-posts/components/marketing-plan-import-dialog'
import MarketingPostHashtagInput from '../features/marketing-posts/components/marketing-post-hashtag-input'
import { useCreateMarketingPost } from '../features/marketing-posts/hooks/use-create-marketing-post'
import { readImageDimensions } from '../features/marketing-posts/image-dimensions'
import {
  MARKETING_POST_CONTENT_MAX,
  MARKETING_POST_IMAGE_MAX,
  MARKETING_POST_TITLE_MAX
} from '../features/marketing-posts/validations'

const POSTS_PATH = `/${HOA_THEO_MUA_ROUTE_PREFIX}/ai-marketing/posts`

const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function FormCard({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('rounded-2xl border bg-card p-5 shadow-sm', className)}>{children}</section>
}

function CharacterCount({ value, max }: { value: string; max: number }) {
  return (
    <p className={cn('text-right text-xs text-muted-foreground', value.length > max && 'text-destructive')}>
      {value.length}/{max}
    </p>
  )
}

export default function MarketingPostCreatePage() {
  const { t } = useTenantTranslation()
  const { methods, onSubmit, onSave, isCreatingMarketingPost } = useCreateMarketingPost()
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting }
  } = methods
  // Ảnh phải nằm trên storage trước: backend chỉ nhận URL tuyệt đối, không nhận blob của trình duyệt
  const { uploadFileWithToast, isUploading } = useUploadFileWithToast()
  const [isPlanImportOpen, setIsPlanImportOpen] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const mediaType = useWatch({ control, name: 'mediaType' })

  const isBusy = isCreatingMarketingPost || isSubmitting || isUploading || isUploadingVideo

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='h-full overflow-auto'>
        <div className='mx-auto w-full max-w-3xl px-6 py-6'>
          <Button type='button' variant='ghost' size='sm' asChild className='mb-4'>
            <Link to={POSTS_PATH}>
              <ArrowLeftIcon data-icon='inline-start' />
              {t('marketingPosts.detail.back')}
            </Link>
          </Button>

          <div className='mb-6'>
            <p className='text-xs font-medium text-primary'>{t('marketingPosts.create.stepOne')}</p>
            <h1 className='mt-1 text-2xl font-bold'>{t('marketingPosts.create.title')}</h1>
            <p className='mt-0.5 text-sm text-muted-foreground'>{t('marketingPosts.create.description')}</p>
          </div>

          {/* Lối tắt cho người có sẵn kế hoạch cả tháng, khỏi tạo tay từng bài */}
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed bg-muted/20 px-4 py-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <FileSpreadsheetIcon className='size-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <p className='text-sm text-muted-foreground'>{t('marketingPosts.create.planImportHint')}</p>
            </div>
            <Button type='button' variant='outline' size='sm' onClick={() => setIsPlanImportOpen(true)}>
              {t('marketingPosts.action.importPlan')}
            </Button>
          </div>

          <div className='space-y-6'>
            <div className='space-y-6'>
              <FormCard className='space-y-4'>
                <Controller
                  name='title'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                      <FieldLabel htmlFor={field.name}>
                        {t('marketingPosts.create.field.title')} <span className='text-destructive'>*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={t('marketingPosts.create.field.titlePlaceholder')}
                        autoComplete='off'
                      />
                      <CharacterCount value={field.value} max={MARKETING_POST_TITLE_MAX} />
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name='content'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                      <FieldLabel htmlFor={field.name}>
                        {t('marketingPosts.create.field.content')} <span className='text-destructive'>*</span>
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={8}
                        aria-invalid={fieldState.invalid}
                        placeholder={t('marketingPosts.create.field.contentPlaceholder')}
                        className='resize-y'
                      />
                      <CharacterCount value={field.value} max={MARKETING_POST_CONTENT_MAX} />
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name='hashtags'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                      <FieldLabel htmlFor={field.name}>{t('marketingPosts.create.field.hashtags')}</FieldLabel>
                      <MarketingPostHashtagInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={t('marketingPosts.create.field.hashtagsPlaceholder')}
                        autoComplete='off'
                      />
                      {fieldState.invalid ? (
                        <FieldError className='text-xs' errors={[fieldState.error]} />
                      ) : (
                        <p className='text-xs text-muted-foreground'>{t('marketingPosts.create.field.hashtagsHint')}</p>
                      )}
                    </Field>
                  )}
                />
              </FormCard>

              <Controller
                name='mediaType'
                control={control}
                render={({ field }) => (
                  <fieldset className='flex gap-4 rounded-xl border p-4'>
                    <legend className='px-2 text-sm font-medium'>{t('marketingPosts.video.mediaType')}</legend>
                    {(['images', 'video'] as const).map((type) => (
                      <label key={type} className='flex items-center gap-2 text-sm'>
                        <input
                          type='radio'
                          name={field.name}
                          value={type}
                          checked={field.value === type}
                          disabled={isBusy}
                          onChange={() => field.onChange(type)}
                        />
                        {t(`marketingPosts.video.type.${type}`)}
                      </label>
                    ))}
                  </fieldset>
                )}
              />
              {mediaType === 'video' && (
                <Controller
                  name='video'
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className='space-y-2'>
                      <MarketingVideoUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isCreatingMarketingPost || isSubmitting}
                        onBusyChange={setIsUploadingVideo}
                      />
                      {fieldState.error && <FieldError errors={[fieldState.error]} />}
                      <p className='text-sm text-muted-foreground'>{t('marketingPosts.video.postOnly')}</p>
                    </div>
                  )}
                />
              )}
              {mediaType === 'images' && (
                <Controller
                  name='images'
                  control={control}
                  render={({ field, fieldState }) => {
                    // Tải lên ngay lúc chọn ảnh: bấm Lưu là gửi được luôn, và admin biết ngay ảnh nào hỏng
                    const addImages = async (files: File[]) => {
                      const room = MARKETING_POST_IMAGE_MAX - getValues('images').length

                      for (const file of files.slice(0, Math.max(0, room))) {
                        const dimensions = await readImageDimensions(file)
                        const url = await uploadFileWithToast({
                          file,
                          loadingDescription: file.name,
                          showSuccessToast: false
                        })

                        if (!url) continue

                        field.onChange([...getValues('images'), { url, name: file.name, ...dimensions }])
                      }
                    }

                    const removeImage = (url: string) =>
                      field.onChange(field.value.filter((image) => image.url !== url))

                    return (
                      <FormCard className='space-y-4'>
                        <div className='flex flex-wrap items-start justify-between gap-2'>
                          <h2 className='font-bold'>{t('marketingPosts.create.section.images')}</h2>
                          {field.value.length > 0 && (
                            <Badge variant='secondary' className='font-normal'>
                              {t('marketingPosts.create.field.imageCount', {
                                count: field.value.length,
                                max: MARKETING_POST_IMAGE_MAX
                              })}
                            </Badge>
                          )}
                        </div>

                        <Field data-invalid={fieldState.invalid} className='gap-3'>
                          <FileDropzone
                            multiple
                            accept={{ 'image/*': [] }}
                            maxSize={MAX_IMAGE_SIZE}
                            disabled={isUploading || field.value.length >= MARKETING_POST_IMAGE_MAX}
                            onFilesChange={addImages}
                            className='rounded-xl border border-dashed bg-muted/20 hover:bg-muted/40'
                          >
                            <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
                              <div className='flex size-10 items-center justify-center rounded-full bg-background shadow-sm'>
                                {isUploading ? (
                                  <Spinner className='size-5 text-muted-foreground' />
                                ) : (
                                  <ImagePlusIcon className='size-5 text-muted-foreground' />
                                )}
                              </div>
                              <p className='text-sm font-medium'>
                                {t('marketingPosts.create.field.imagesPlaceholder')}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {t('marketingPosts.create.field.imagesSizeHint')}
                              </p>
                            </div>
                          </FileDropzone>

                          {field.value.map((image) => (
                            <div key={image.url} className='flex items-start gap-3 rounded-xl border p-4'>
                              <img
                                src={image.url}
                                alt={image.name}
                                className='size-14 shrink-0 rounded-lg border bg-muted/40 object-cover'
                              />
                              <div className='min-w-0 flex-1'>
                                <p className='truncate text-sm font-medium'>{image.name}</p>
                                {image.width && image.height && (
                                  <p className='mt-0.5 text-xs text-muted-foreground tabular-nums'>
                                    {image.width} × {image.height}
                                  </p>
                                )}
                              </div>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                aria-label={t('marketingPosts.create.field.removeImage', { name: image.name })}
                                onClick={() => removeImage(image.url)}
                                className='size-8 shrink-0'
                              >
                                <XIcon />
                              </Button>
                            </div>
                          ))}

                          {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                        </Field>
                      </FormCard>
                    )
                  }}
                />
              )}
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-xs text-muted-foreground'>{t('marketingPosts.create.imagesNote')}</p>
              <div className='flex items-center gap-2'>
                {/* Lưu bài gốc rồi để đó, chọn nền tảng sau - backend cũng cho POST /posts đứng riêng */}
                <Button type='button' variant='outline' onClick={handleSubmit(onSave)} disabled={isBusy}>
                  {t('marketingPosts.create.saveDraft')}
                </Button>
                <Button type='submit' disabled={isBusy}>
                  {isBusy && <Spinner />}
                  {t('marketingPosts.create.nextStep')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <MarketingPlanImportDialog open={isPlanImportOpen} onOpenChange={setIsPlanImportOpen} />
    </>
  )
}
