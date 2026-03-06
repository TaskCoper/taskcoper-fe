import { Button } from '@/components/ui/button'
import SubmitMentorApplicationForm from '@/features/mentor-applications/components/submit-mentor-application-form'
import { useSubmitMentorApplication } from '@/features/mentor-applications/hooks/use-submit-mentor-application'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export default function MentorApplicationPage() {
  const { t } = useTranslation()
  const { methods, onSubmit, uploadStatuses, clearUploadStatuses } = useSubmitMentorApplication()

  return (
    <div className='absolute inset-0 overflow-auto'>
      <div className='mx-auto max-w-4xl space-y-10 p-4 pb-10'>
        <div>
          <p className='text-2xl font-bold'>{t('mentorApplication.page.title')}</p>
          <p className='text-muted-foreground text-sm'>{t('mentorApplication.page.description')}</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
            <SubmitMentorApplicationForm uploadStatuses={uploadStatuses} onClearStatuses={clearUploadStatuses} />

            <div className='flex justify-end'>
              <Button type='submit' disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting
                  ? t('mentorApplication.submit.buttonUploading')
                  : t('mentorApplication.submit.button')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
