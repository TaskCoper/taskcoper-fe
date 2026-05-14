import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import type { UserDetail } from '@/features/users/types'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useUpdateMentorProfile } from '../../hooks/use-update-mentor-profile'
import type { UpdateMentorProfileFormValues } from '../../validations'

interface UpdateMentorShortBioDialogProps {
  children: React.ReactNode
  user: UserDetail
}

export default function UpdateMentorShortBioDialog({ children, user }: UpdateMentorShortBioDialogProps) {
  const { t } = useTranslation()
  const { userIdentifier } = useParams<{ userIdentifier: string }>()
  const [open, setOpen] = useState(false)
  const { methods, updateMentorProfile, isUpdatingMentorProfile } = useUpdateMentorProfile()

  useEffect(() => {
    if (open && user.mentor) {
      methods.reset({
        userIdentifier: userIdentifier ?? user.id,
        shortBio: user.mentor.shortBio ?? '',
        description: user.mentor.description ?? ''
      })
    }
  }, [open, user, methods, userIdentifier])

  const onSubmit: SubmitHandler<UpdateMentorProfileFormValues> = (body) => {
    updateMentorProfile(
      { body },
      {
        onSuccess: () => {
          setOpen(false)
        }
      }
    )
  }

  const onClose = () => {
    setOpen(false)
    methods.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          methods.reset()
        }
        setOpen(isOpen)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        position='top-center'
        className='w-[95vw] sm:w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'
        onInteractOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle>{t('mentor.updateProfile.shortBio.title')}</DialogTitle>
          <DialogDescription>{t('mentor.updateProfile.shortBio.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-full space-y-4'>
            <div className='flex flex-col gap-2 w-full'>
              <Controller
                name='shortBio'
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1'>
                    <FieldLabel htmlFor={field.name}>{t('mentor.updateProfile.shortBio.label')}</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={field.name}
                        placeholder={t('mentor.updateProfile.shortBio.placeholder')}
                        rows={4}
                        autoFocus
                        className='min-h-24 resize-none wrap-break-word'
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align='block-end'>
                        <InputGroupText className='tabular-nums text-xs'>
                          {field.value?.length ?? 0}/255 {t('common.ui.characters')}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <div className='min-h-4'>
                      {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                    </div>
                  </Field>
                )}
              />
            </div>

            <div className='flex flex-col-reverse sm:flex-row items-center gap-3 justify-end'>
              <Button
                type='button'
                variant='ghost'
                onClick={onClose}
                className='w-full sm:w-auto'
                disabled={isUpdatingMentorProfile}
              >
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' className='w-full sm:w-auto' disabled={isUpdatingMentorProfile}>
                {isUpdatingMentorProfile ? <Spinner /> : null}
                {t('common.button.submit')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
