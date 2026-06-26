import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, Circle, ImageIcon, UploadIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useFormContext, useWatch, type SubmitHandler } from 'react-hook-form'
import type { CreateJobDescriptionFormValues } from '../validations'

interface CreateJobDescriptionFormProps {
  onSubmit: SubmitHandler<CreateJobDescriptionFormValues>
  isLoading?: boolean
}

const STEPS = [
  {
    key: 'details',
    labelKey: 'recruitment.jobs.form.step.details.label',
    descKey: 'recruitment.jobs.form.step.details.description'
  },
  {
    key: 'jobDescription',
    labelKey: 'recruitment.jobs.form.step.jobDescription.label',
    descKey: 'recruitment.jobs.form.step.jobDescription.description'
  },
  {
    key: 'experience',
    labelKey: 'recruitment.jobs.form.step.experience.label',
    descKey: 'recruitment.jobs.form.step.experience.description'
  },
  {
    key: 'salary',
    labelKey: 'recruitment.jobs.form.step.salary.label',
    descKey: 'recruitment.jobs.form.step.salary.description'
  },
  {
    key: 'review',
    labelKey: 'recruitment.jobs.form.step.review.label',
    descKey: 'recruitment.jobs.form.step.review.description'
  }
] as const

const STEP_FIELDS: (keyof CreateJobDescriptionFormValues)[][] = [
  ['title', 'location', 'openings', 'employmentType', 'status'],
  ['avatarUrl', 'coverImageUrl', 'description'],
  ['minExperienceYears', 'maxExperienceYears'],
  ['salaryMin', 'salaryMax', 'salaryNegotiable'],
  []
]

function Stepper({ currentStep, t }: { currentStep: number; t: ReturnType<typeof useTenantTranslation>['t'] }) {
  return (
    <div className='space-y-3'>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep

        return (
          <Card key={step.key} className='px-3 py-2 gap-0 shadow-none'>
            <div className='flex items-center gap-2'>
              <div className='shrink-0'>
                {isCompleted ? (
                  <div className='flex size-4 items-center justify-center rounded-full bg-primary'>
                    <CheckIcon className='size-3 text-primary-foreground' strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  <Spinner className='size-4 text-foreground' strokeWidth={1.75} />
                ) : (
                  <Circle className='size-4 text-muted-foreground/40' strokeWidth={1.5} />
                )}
              </div>
              <p
                className={cn(
                  'text-sm font-medium',
                  isActive && 'text-foreground',
                  isCompleted && 'text-foreground',
                  !isActive && !isCompleted && 'text-muted-foreground/70'
                )}
              >
                {t(step.labelKey)}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function StepDetails() {
  const { t } = useTenantTranslation()
  const { control } = useFormContext<CreateJobDescriptionFormValues>()

  return (
    <div className='space-y-4'>
      <Controller
        name='title'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={t('recruitment.jobs.form.field.title.placeholder')}
              spellCheck={false}
              autoFocus
              className='resize-none border-none ring-transparent shadow-none px-0 text-5xl! h-auto rounded-none font-bold focus-visible:ring-transparent'
            />
          </Field>
        )}
      />

      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='location'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.column.location')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('recruitment.jobs.form.field.location.placeholder')}
                spellCheck={false}
                autoComplete='off'
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
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
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='employmentType'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.column.employmentType')}
                <span className='text-destructive font-semibold'>*</span>
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
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='status'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.column.status')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} size='sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>{t('recruitment.jobs.status.open')}</SelectItem>
                  <SelectItem value='1'>{t('recruitment.jobs.status.closed')}</SelectItem>
                </SelectContent>
              </Select>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>
    </div>
  )
}

function StepJobDescription() {
  const { t } = useTenantTranslation()
  const { control } = useFormContext<CreateJobDescriptionFormValues>()
  const { uploadFileWithToast: uploadAvatar, isUploading: isUploadingAvatar } = useUploadFileWithToast()
  const { uploadFileWithToast: uploadCover, isUploading: isUploadingCover } = useUploadFileWithToast()
  const avatarFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='avatarUrl'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel className='gap-0.5'>
                {t('recruitment.jobs.form.field.avatarUrl.label')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
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
              <button
                type='button'
                className={cn(
                  'relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-colors',
                  fieldState.invalid ? 'border-destructive' : 'border-border',
                  !field.value && 'hover:bg-muted/50'
                )}
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {field.value ? (
                  <>
                    <img src={field.value} alt='' className='size-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity'>
                      {isUploadingAvatar ? (
                        <Spinner className='size-5 text-white' />
                      ) : (
                        <UploadIcon className='size-5 text-white' />
                      )}
                    </div>
                  </>
                ) : (
                  <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                    {isUploadingAvatar ? <Spinner className='size-5' /> : <ImageIcon className='size-5' />}
                    <span className='text-xs'>
                      {isUploadingAvatar ? t('common.ui.uploading') : t('common.button.upload')}
                    </span>
                  </div>
                )}
              </button>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='coverImageUrl'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel className='gap-0.5'>
                {t('recruitment.jobs.form.field.coverImageUrl.label')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
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
              <button
                type='button'
                className={cn(
                  'relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-colors',
                  fieldState.invalid ? 'border-destructive' : 'border-border',
                  !field.value && 'hover:bg-muted/50'
                )}
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploadingCover}
              >
                {field.value ? (
                  <>
                    <img src={field.value} alt='' className='size-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity'>
                      {isUploadingCover ? (
                        <Spinner className='size-5 text-white' />
                      ) : (
                        <UploadIcon className='size-5 text-white' />
                      )}
                    </div>
                  </>
                ) : (
                  <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                    {isUploadingCover ? <Spinner className='size-5' /> : <ImageIcon className='size-5' />}
                    <span className='text-xs'>
                      {isUploadingCover ? t('common.ui.uploading') : t('common.button.upload')}
                    </span>
                  </div>
                )}
              </button>
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

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
    </div>
  )
}

function StepExperience() {
  const { t } = useTenantTranslation()
  const { control } = useFormContext<CreateJobDescriptionFormValues>()

  return (
    <div className='space-y-4'>
      <div className='-space-y-1'>
        <p className='text-lg font-semibold'>{t('recruitment.jobs.form.field.experience.label')}</p>
        <p className='text-sm text-muted-foreground'>{t('recruitment.jobs.form.field.experience.description')}</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='minExperienceYears'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.form.field.experience.min')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                inputMode='numeric'
                aria-invalid={fieldState.invalid}
                placeholder={t('recruitment.jobs.form.field.experience.minPlaceholder')}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='maxExperienceYears'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.form.field.experience.max')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                inputMode='numeric'
                aria-invalid={fieldState.invalid}
                placeholder={t('recruitment.jobs.form.field.experience.maxPlaceholder')}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>
    </div>
  )
}

function StepSalary() {
  const { t } = useTenantTranslation()
  const { control } = useFormContext<CreateJobDescriptionFormValues>()

  return (
    <div className='space-y-4'>
      <div className='-space-y-1'>
        <p className='text-lg font-semibold'>{t('recruitment.jobs.column.salary')}</p>
        <p className='text-sm text-muted-foreground'>{t('recruitment.jobs.form.field.salary.description')}</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Controller
          name='salaryMin'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.form.field.salary.min')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                inputMode='numeric'
                aria-invalid={fieldState.invalid}
                placeholder={t('recruitment.jobs.form.field.salary.minPlaceholder')}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='salaryMax'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('recruitment.jobs.form.field.salary.max')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                inputMode='numeric'
                aria-invalid={fieldState.invalid}
                placeholder={t('recruitment.jobs.form.field.salary.maxPlaceholder')}
              />
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <Controller
        name='salaryNegotiable'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation='horizontal'
            data-invalid={fieldState.invalid}
            className='p-3 bg-muted/60 rounded-md border border-dashed items-center'
          >
            <FieldContent className='gap-0'>
              <FieldLabel htmlFor={field.name}>{t('recruitment.jobs.form.field.salary.negotiable')}</FieldLabel>
              <FieldDescription className='text-xs'>
                {t('recruitment.jobs.form.field.salary.negotiableDescription')}
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
            <Switch
              id={field.name}
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start gap-4 py-2.5 border-b last:border-0'>
      <span className='text-sm text-muted-foreground w-40 shrink-0'>{label}</span>
      <span className='text-sm font-medium flex-1'>{value || <span className='text-muted-foreground/50'>-</span>}</span>
    </div>
  )
}

function StepReview() {
  const { t } = useTenantTranslation()
  const values = useWatch<CreateJobDescriptionFormValues>()

  const employmentTypeLabels: Record<string, string> = {
    '0': t('recruitment.jobs.employmentType.fullTime'),
    '1': t('recruitment.jobs.employmentType.partTime')
  }

  const statusLabels: Record<string, string> = {
    '0': t('recruitment.jobs.status.open'),
    '1': t('recruitment.jobs.status.closed')
  }

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-lg font-semibold'>{t('recruitment.jobs.form.review.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('recruitment.jobs.form.review.description')}</p>
      </div>

      <Card className='px-4 py-1 gap-0 rounded-3xl'>
        <ReviewRow label={t('recruitment.jobs.column.title')} value={values.title} />
        <ReviewRow label={t('recruitment.jobs.column.location')} value={values.location} />
        <ReviewRow label={t('recruitment.jobs.form.field.openings.label')} value={values.openings} />
        <ReviewRow
          label={t('recruitment.jobs.column.employmentType')}
          value={values.employmentType ? employmentTypeLabels[values.employmentType] : null}
        />
        <ReviewRow
          label={t('recruitment.jobs.column.status')}
          value={values.status ? statusLabels[values.status] : null}
        />
        <ReviewRow
          label={t('recruitment.jobs.form.field.experience.label')}
          value={
            values.minExperienceYears && values.maxExperienceYears
              ? t('recruitment.jobs.form.review.experienceRange', {
                  min: values.minExperienceYears,
                  max: values.maxExperienceYears
                })
              : null
          }
        />
        <ReviewRow
          label={t('recruitment.jobs.column.salary')}
          value={
            values.salaryNegotiable
              ? t('recruitment.jobs.salary.negotiable')
              : values.salaryMin && values.salaryMax
                ? `${Number(values.salaryMin).toLocaleString()} – ${Number(values.salaryMax).toLocaleString()}`
                : null
          }
        />
        <ReviewRow label={t('recruitment.jobs.form.field.avatarUrl.label')} value={values.avatarUrl} />
        <ReviewRow label={t('recruitment.jobs.form.field.coverImageUrl.label')} value={values.coverImageUrl} />
      </Card>
    </div>
  )
}

export default function CreateJobDescriptionForm({ onSubmit, isLoading }: CreateJobDescriptionFormProps) {
  const { t } = useTenantTranslation()
  const { trigger, handleSubmit } = useFormContext<CreateJobDescriptionFormValues>()
  const [step, setStep] = useState(0)

  const isLastStep = step === STEPS.length - 1

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step] as (keyof CreateJobDescriptionFormValues)[])
    if (valid) setStep((s) => s + 1)
  }

  const handleBack = () => setStep((s) => s - 1)

  return (
    <div className='flex gap-8'>
      <div className='flex-1 min-w-0 space-y-8'>
        <div className='min-h-96'>
          {step === 0 && <StepDetails />}
          {step === 1 && <StepJobDescription />}
          {step === 2 && <StepExperience />}
          {step === 3 && <StepSalary />}
          {step === 4 && <StepReview />}
        </div>

        <div className='flex items-center justify-end gap-3 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={handleBack}
            disabled={step === 0 || isLoading}
            className='text-muted-foreground'
          >
            {t('common.button.back')}
          </Button>

          {isLastStep ? (
            <Button type='button' onClick={handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              {t('recruitment.jobs.form.action.publish')}
            </Button>
          ) : (
            <Button type='button' onClick={handleNext} disabled={isLoading}>
              {t('recruitment.jobs.form.action.continue')}
            </Button>
          )}
        </div>
      </div>

      <aside className='w-72 shrink-0'>
        <Stepper currentStep={step} t={t} />
      </aside>
    </div>
  )
}
