import RichTextEditor from '@/components/rich-text-editor'
import SingleSelectField from '@/components/single-select-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import type { MentorPackage } from '@/features/mentor-packages/types'
import { useGetProjectsForPackage } from '@/features/projects/core/hooks/use-get-projects-for-package'
import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRequestPackage } from '../hooks/use-request-package'
import type { RequestPackageFormValues } from '../validations'

interface RequestPackageDialogProps {
  children: React.ReactNode
  mentorPackage: MentorPackage
}

export default function RequestPackageDialog({ children, mentorPackage }: RequestPackageDialogProps) {
  const { t } = useTranslation()
  const { methods, requestPackage, isRequestingPackage } = useRequestPackage()

  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  const onSubmit: SubmitHandler<RequestPackageFormValues> = (body) => {
    requestPackage(
      { body },
      {
        onSuccess: () => onClose()
      }
    )
  }

  const { projects: requestableProjects, isLoadingProjects: isLoadingRequestableProjects } =
    useGetProjectsForPackage(open)

  const projectOptions = useMemo(
    () => requestableProjects.value.items.map((project) => ({ value: project.id, label: project.name })),
    [requestableProjects.value.items]
  )

  useEffect(() => {
    const values = methods.getValues()

    methods.reset({
      ...values,
      mentorPackageId: mentorPackage.id
    })
  }, [mentorPackage, methods])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          methods.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-3xl' onInteractOutside={onClose} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('packageBooking.requestPackage.title')}</DialogTitle>
          <DialogDescription>{mentorPackage.name}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          {/* <Card className='gap-3 rounded-xl p-1 shadow-sm'>
            {mentorPackage.coverImageUrl ? (
              <img
                src={mentorPackage.coverImageUrl}
                alt={mentorPackage.name}
                className='h-40 w-full rounded-md object-cover'
              />
            ) : (
              <div className='h-40 rounded-md border border-dashed border-border bg-linear-to-br from-primary/20 via-primary/10 to-background' />
            )}

            <div className='space-y-1.5 px-3 pb-3'>
              <p className='line-clamp-2 text-base font-semibold leading-snug'>{mentorPackage.name}</p>
              <p className='line-clamp-2 text-xs text-muted-foreground'>
                {getFirstParagraphTextFromHtml(mentorPackage.description)}
              </p>
            </div>
          </Card> */}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
              <SingleSelectField
                control={methods.control}
                name='bookedByProjectId'
                label='meeting.form.projectLabel'
                options={projectOptions}
                placeholder='meeting.form.projectPlaceholder'
                searchPlaceholder='meeting.form.projectSearchPlaceholder'
                disabled={isLoadingRequestableProjects}
                displayError={false}
              />

              <Controller
                name='problemStatement'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name} className='gap-0.5'>
                      {t('packageBooking.requestPackage.problemStatement')}
                      <span className='font-semibold text-destructive'>*</span>
                    </FieldLabel>

                    <RichTextEditor
                      content={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder='packageBooking.requestPackage.problemStatementPlaceholder'
                      invalid={fieldState.invalid}
                      error={fieldState.error}
                    />
                  </Field>
                )}
              />

              <Button className='w-full' disabled={isRequestingPackage || isLoadingRequestableProjects}>
                {isRequestingPackage ? <Spinner /> : null}
                {t('packageBooking.requestPackage.proceed')}
              </Button>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
