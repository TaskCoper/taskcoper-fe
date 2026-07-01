import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ImageOffIcon, UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { Controller, useFormContext, useWatch, type SubmitHandler } from 'react-hook-form'
import { useGetCompanyAddress } from '../../company-addresses/hooks/use-get-company-address'
import type { CreateJobDescriptionFormValues } from '../validations'

interface EditJobDescriptionFormProps {
  onSubmit: SubmitHandler<CreateJobDescriptionFormValues>
  onCancel: () => void
  isLoading?: boolean
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className='size-full flex items-center justify-center bg-muted rounded-xl'>
        <ImageOffIcon className='size-5 text-muted-foreground' />
      </div>
    )
  }
  return <img src={src} alt={alt} className='size-full object-cover rounded-xl' />
}

export default function EditJobDescriptionForm({ onSubmit, onCancel, isLoading }: EditJobDescriptionFormProps) {
  const { t } = useTenantTranslation()
  const { handleSubmit, control } = useFormContext<CreateJobDescriptionFormValues>()

  const avatarUrl = useWatch({ control, name: 'avatarUrl' })
  const coverImageUrl = useWatch({ control, name: 'coverImageUrl' })
  const salaryNegotiable = useWatch({ control, name: 'salaryNegotiable' })

  const { uploadFileWithToast: uploadAvatar, isUploading: isUploadingAvatar } = useUploadFileWithToast()
  const { uploadFileWithToast: uploadCover, isUploading: isUploadingCover } = useUploadFileWithToast()
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const { companyAddress } = useGetCompanyAddress()

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 lg:gap-8'>
      {/* Left column */}
      <div className='col-span-1 lg:col-span-8 space-y-6'>
        {/* Title */}
        <Controller
          name='title'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-0'>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('recruitment.jobs.form.field.title.placeholder')}
                spellCheck={false}
                autoFocus
                className='resize-none border-none ring-transparent shadow-none px-0 text-5xl! h-auto rounded-none font-bold focus-visible:ring-transparent'
              />
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Media */}
        <Card className='p-4 shadow-none rounded-2xl gap-4'>
          <div>
            <p className='text-sm font-semibold'>{t('recruitment.jobs.form.step.jobDescription.label')}</p>
            <p className='text-xs text-muted-foreground'>
              {t('recruitment.jobs.form.step.jobDescription.description')}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Controller
                name='avatarUrl'
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      ref={avatarFileInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        e.target.value = ''
                        const url = await uploadAvatar({ file, showSuccessToast: false })
                        if (url) field.onChange(url)
                      }}
                    />
                    <div
                      className={cn(
                        'relative h-20 border rounded-xl overflow-hidden cursor-pointer group',
                        fieldState.invalid ? 'border-destructive' : 'border-border'
                      )}
                      onClick={() => avatarFileInputRef.current?.click()}
                    >
                      <ImagePreview src={avatarUrl ?? ''} alt='Avatar preview' />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'>
                        {isUploadingAvatar ? (
                          <Spinner className='size-4 text-white' />
                        ) : (
                          <UploadIcon className='size-4 text-white' />
                        )}
                      </div>
                    </div>
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel className='gap-0.5 text-xs'>
                        {t('recruitment.jobs.form.field.avatarUrl.label')}
                      </FieldLabel>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </Field>
                  </>
                )}
              />
            </div>

            <div className='space-y-2'>
              <Controller
                name='coverImageUrl'
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      ref={coverFileInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        e.target.value = ''
                        const url = await uploadCover({ file, showSuccessToast: false })
                        if (url) field.onChange(url)
                      }}
                    />
                    <div
                      className={cn(
                        'relative h-20 border rounded-xl overflow-hidden cursor-pointer group',
                        fieldState.invalid ? 'border-destructive' : 'border-border'
                      )}
                      onClick={() => coverFileInputRef.current?.click()}
                    >
                      <ImagePreview src={coverImageUrl ?? ''} alt='Cover preview' />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'>
                        {isUploadingCover ? (
                          <Spinner className='size-4 text-white' />
                        ) : (
                          <UploadIcon className='size-4 text-white' />
                        )}
                      </div>
                    </div>
                    <Field data-invalid={fieldState.invalid} className='gap-0.5'>
                      <FieldLabel className='gap-0.5 text-xs'>
                        {t('recruitment.jobs.form.field.coverImageUrl.label')}
                      </FieldLabel>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </Field>
                  </>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Description */}
        <Controller
          name='description'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.form.field.description.label')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder={'recruitment.jobs.form.field.description.placeholder' as I18nKey}
                invalid={fieldState.invalid}
                error={fieldState.error}
                className='min-h-64'
              />
            </Field>
          )}
        />

        {/* Actions */}
        <div className='flex gap-2 items-center justify-end'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
            {t('common.button.cancel')}
          </Button>
          <Button type='button' onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? <Spinner /> : null}
            {t('common.button.save')}
          </Button>
        </div>
      </div>

      {/* Right column */}
      <div className='col-span-1 lg:col-span-4 space-y-6 mt-6 lg:mt-0'>
        {/* Status */}
        <div className='space-y-2'>
          <p className='font-semibold'>{t('recruitment.jobs.column.status')}</p>
          <Controller
            name='status'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>{t('recruitment.jobs.status.open')}</SelectItem>
                    <SelectItem value='1'>{t('recruitment.jobs.status.closed')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Separator />

        {/* Salary */}
        <div className='space-y-4'>
          <div>
            <p className='font-semibold'>{t('recruitment.jobs.detail.salary')}</p>
            <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.salaryDescription')}</p>
          </div>

          <Controller
            name='salaryNegotiable'
            control={control}
            render={({ field }) => (
              <Field orientation='horizontal' className='p-3 bg-muted/60 rounded-md border border-dashed items-center'>
                <FieldContent className='gap-0'>
                  <FieldLabel htmlFor={field.name}>{t('recruitment.jobs.form.field.salary.negotiable')}</FieldLabel>
                  <FieldDescription className='text-xs'>
                    {t('recruitment.jobs.form.field.salary.negotiableDescription')}
                  </FieldDescription>
                </FieldContent>
                <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )}
          />

          {!salaryNegotiable && (
            <div className='grid grid-cols-2 gap-3'>
              <Controller
                name='salaryMin'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='text-xs'>
                      {t('recruitment.jobs.form.field.salary.min')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode='numeric'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('recruitment.jobs.form.field.salary.minPlaceholder')}
                    />
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='salaryMax'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='text-xs'>
                      {t('recruitment.jobs.form.field.salary.max')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode='numeric'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('recruitment.jobs.form.field.salary.maxPlaceholder')}
                    />
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* General */}
        <div className='space-y-4'>
          <div>
            <p className='font-semibold'>{t('recruitment.jobs.detail.general')}</p>
            <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.detail.generalDescription')}</p>
          </div>

          <Controller
            name='location'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name} className='gap-0.5'>
                  {t('recruitment.jobs.column.location')}
                  <span className='text-destructive font-semibold'>*</span>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={t('recruitment.jobs.form.field.location.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={companyAddress!.city} value={companyAddress!.city}>
                      {companyAddress!.city}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='employmentType'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name} className='gap-0.5 text-xs'>
                  {t('recruitment.jobs.column.employmentType')}
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} size='sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>{t('recruitment.jobs.employmentType.fullTime')}</SelectItem>
                    <SelectItem value='1'>{t('recruitment.jobs.employmentType.partTime')}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name='openings'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1'>
                <FieldLabel htmlFor={field.name} className='gap-0.5'>
                  {t('recruitment.jobs.form.field.openings.label')}
                  <span className='text-destructive font-semibold'>*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  inputMode='numeric'
                  aria-invalid={fieldState.invalid}
                  placeholder={t('recruitment.jobs.form.field.openings.placeholder')}
                />
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Separator />

          <div className='space-y-3'>
            <div>
              <p className='text-sm font-semibold'>{t('recruitment.jobs.detail.experience')}</p>
              <p className='text-xs text-muted-foreground'>{t('recruitment.jobs.form.field.experience.description')}</p>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <Controller
                name='minExperienceYears'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='gap-0.5 text-xs'>
                      {t('recruitment.jobs.form.field.experience.min')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode='numeric'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('recruitment.jobs.form.field.experience.minPlaceholder')}
                    />
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name='maxExperienceYears'
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='gap-0.5 text-xs'>
                      {t('recruitment.jobs.form.field.experience.max')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode='numeric'
                      aria-invalid={fieldState.invalid}
                      placeholder={t('recruitment.jobs.form.field.experience.maxPlaceholder')}
                    />
                    {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
