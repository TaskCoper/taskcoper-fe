import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { TriangleAlertIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { PublicationReviewAction, type PublicationResolveAction } from '../types'
import { createResolvePublicationSchema, type ResolvePublicationForm } from '../validations'

const resolveActions: PublicationResolveAction[] = [
  PublicationReviewAction.ConfirmPublished,
  PublicationReviewAction.ConfirmNotPublished,
  PublicationReviewAction.Close
]

// Đối soát job NeedsReview. Lưu ý quan trọng: xác nhận ở đây KHÔNG ép được kết quả - backend
// vẫn gọi adapter kiểm lại, và job có thể ở nguyên NeedsReview sau khi request trả 200.
const MarketingPublicationReviewDialog = ({
  open,
  onOpenChange,
  isBusy,
  onSubmit
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isBusy: boolean
  onSubmit: (values: { action: PublicationResolveAction; note: string; externalPostId: string }) => void
}) => {
  const { t } = useTenantTranslation()
  const methods = useForm<ResolvePublicationForm>({
    resolver: zodResolver(createResolvePublicationSchema(t)),
    defaultValues: { action: PublicationReviewAction.ConfirmPublished, externalPostId: '', note: '' }
  })
  const { control, handleSubmit, reset } = methods
  // `useWatch` thay cho `methods.watch`: watch() trả hàm mới mỗi render nên React Compiler bỏ
  // memo cả component này
  const action = useWatch({ control, name: 'action' })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('marketingPosts.publication.review.title')}</DialogTitle>
          <DialogDescription>{t('marketingPosts.publication.review.description')}</DialogDescription>
        </DialogHeader>

        <form id='publication-review-form' onSubmit={handleSubmit((values) => onSubmit(values))} className='space-y-4'>
          <Controller
            name='action'
            control={control}
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className='gap-2'>
                {resolveActions.map((option) => (
                  <label
                    key={option}
                    htmlFor={`resolve-${option}`}
                    className='flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/40 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5'
                  >
                    <RadioGroupItem id={`resolve-${option}`} value={option} className='mt-0.5' />
                    <span className='min-w-0'>
                      <span className='block font-medium'>
                        {t(`marketingPosts.publication.review.action.${option}`)}
                      </span>
                      <span className='mt-0.5 block text-xs text-muted-foreground'>
                        {t(`marketingPosts.publication.review.actionHint.${option}`)}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />

          {action === PublicationReviewAction.ConfirmPublished && (
            <Controller
              name='externalPostId'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='resolve-external-post-id'>
                    {t('marketingPosts.publication.review.externalPostId')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id='resolve-external-post-id'
                    placeholder={t('marketingPosts.publication.review.externalPostIdPlaceholder')}
                  />
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}

          <Controller
            name='note'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='resolve-note'>{t('marketingPosts.publication.review.note')}</FieldLabel>
                <Textarea
                  {...field}
                  id='resolve-note'
                  rows={3}
                  placeholder={t('marketingPosts.publication.review.notePlaceholder')}
                />
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Đóng xử lý không gỡ bài ngoài Meta và cũng không mở lại quyền đăng */}
          {action === PublicationReviewAction.Close && (
            <p className='flex items-start gap-1.5 rounded-lg border border-amber-300/60 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'>
              <TriangleAlertIcon className='mt-0.5 size-3.5 shrink-0' />
              {t('marketingPosts.publication.review.closeWarning')}
            </p>
          )}
        </form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.button.cancel')}
          </Button>
          <Button type='submit' form='publication-review-form' disabled={isBusy}>
            {isBusy && <Spinner />}
            {t('marketingPosts.publication.review.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MarketingPublicationReviewDialog
