import RichTextEditor from '@/components/rich-text-editor'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { packageFeedbackQuestionIds, packageFeedbackQuestions } from '@/features/feedbacks/constants'
import { useSubmitPackageFeedback } from '@/features/feedbacks/hooks/use-submit-package-feedback'
import { calculatePackageFeedbackRating } from '@/features/feedbacks/utils'
import type { SubmitPackageFeedbackFormValues } from '@/features/feedbacks/validations'
import { useGetPurchasedMentorPackage } from '@/features/mentor-packages/hooks/use-get-purchased-mentor-package'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { SendIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, FormProvider, useWatch, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'

export default function PackageFeedbackPage() {
  const navigate = useNavigate()
  const { packageId } = useParams<{ packageId: string }>()
  const { t } = useTranslation()

  const { purchasedMentorPackage } = useGetPurchasedMentorPackage({ packageId })
  const { methods, submitFeedback, isSubmittingFeedback } = useSubmitPackageFeedback({ packageId })
  const { confirm } = useConfirmStore()
  const metadata = useWatch({ control: methods.control, name: 'metadata' })

  const onSubmit: SubmitHandler<SubmitPackageFeedbackFormValues> = async (body) => {
    const ok = await confirm({
      title: t('packageFeedback.confirm.title'),
      description: t('packageFeedback.confirm.description'),
      confirmText: t('packageFeedback.submitButton'),
      cancelText: t('common.button.cancel'),
      variant: 'default'
    })

    if (!ok) {
      return
    }

    const ratings = Object.fromEntries(packageFeedbackQuestionIds.map((id) => [id, Number(body['metadata'][id])]))

    submitFeedback({
      body: { ...body, metadata: JSON.stringify(ratings) }
    })
  }

  useEffect(() => {
    methods.register('targetType')
    methods.register('targetId')
    methods.register('rating')

    if (packageId) {
      methods.setValue('targetType', 'MentorPackageBooking')
      methods.setValue('targetId', packageId)
    }
  }, [packageId, methods])

  useEffect(() => {
    if (!metadata) {
      return
    }

    methods.setValue('rating', calculatePackageFeedbackRating(metadata), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true
    })
  }, [methods, metadata])

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='max-w-4xl w-full mx-auto p-6 space-y-8'>
        <div>
          <Link to={`/purchases/${packageId}`} className='hover:underline hover:text-primary'>
            <p className='text-2xl font-bold'>{purchasedMentorPackage?.name}</p>
          </Link>
          <p className='text-sm text-muted-foreground'>{t('packageFeedback.description')}</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-2'>
            {packageFeedbackQuestions.map((q, index) => (
              <Controller
                key={q.id}
                name={`metadata.${q.id}`}
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-3'>
                    <FieldLabel className='text-base'>
                      {index + 1}. {t(q.titleKey)}
                    </FieldLabel>

                    <RadioGroup value={field.value} onValueChange={field.onChange} className='gap-2'>
                      {q.options.map((opt) => (
                        <div key={opt.value} className='flex items-center gap-2'>
                          <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                          <Label htmlFor={`${q.id}-${opt.value}`} className='font-normal cursor-pointer'>
                            {t(opt.labelKey)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />
            ))}

            <Controller
              name='comment'
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <FieldLabel>{t('packageFeedback.noteLabel')}</FieldLabel>

                  <RichTextEditor
                    isInitialFocus={false}
                    content={field.value ?? ''}
                    onChange={field.onChange}
                    compact
                    placeholder='packageFeedback.notePlaceholder'
                  />
                </Field>
              )}
            />

            <div className='flex justify-end items-center gap-2'>
              <Button type='button' variant='ghost' onClick={() => navigate(-1)}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' className='gap-2' disabled={methods.formState.isSubmitting || isSubmittingFeedback}>
                {isSubmittingFeedback ? <Spinner /> : <SendIcon />}
                {t('packageFeedback.submitButton')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
