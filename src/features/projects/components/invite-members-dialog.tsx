import AsyncMultiSelectField from '@/components/async-multi-select-field'
import { DatePickerField } from '@/components/date-picker-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useGetUsers } from '@/features/users/hooks/use-get-users'
import type { InviteMembersPayload } from '@/types/project.type'
import { addDays } from 'date-fns'
import { useState } from 'react'
import { Controller, FormProvider, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import { useInviteMembers } from '../hooks/use-invite-members'
import type { InviteMemberItem, InviteMembersFormValues } from '../validations'
import InviteMembersForm from './invite-members-form'

interface ComboboxUserItem {
  id: string
  email: string
  fullName: string
  avatar: string | null
}

interface InviteMembersDialogProps {
  children: React.ReactNode
  projectId: string
}

export default function InviteMembersDialog({ children, projectId }: InviteMembersDialogProps) {
  const { t } = useTranslation()
  const { methods, open, setOpen, inviteMembers, isInvitingMembers } = useInviteMembers({ projectId })

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchQuery] = useDebounce(searchTerm, 500)

  const { control, handleSubmit, watch } = methods

  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'inviteMembers'
  })

  const hasExpiration = watch('hasExpiration')

  const { users, isLoadingUsers } = useGetUsers({
    searchTerm: debouncedSearchQuery
  })

  const userItems: ComboboxUserItem[] = users.value.items.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: `${u.firstName} ${u.lastName}`,
    avatar: u.avatar
  }))

  const onSubmit: SubmitHandler<InviteMembersFormValues> = (data) => {
    const finalExpireDate =
      data.hasExpiration && data.expirationDate
        ? typeof data.expirationDate === 'string'
          ? data.expirationDate
          : data.expirationDate
        : null

    const body: InviteMembersPayload = {
      projectId: data.projectId,
      inviteMembers: data.inviteMembers.map((u) => ({
        userId: u.userId,
        isEditor: u.isEditor,
        inviteExpireDate: finalExpireDate
      }))
    }

    inviteMembers({ body })
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.stopPropagation()
    handleSubmit(onSubmit)(e)
  }

  const onClose = () => {
    methods.reset()
    setOpen(false)
  }

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
      <DialogContent position='top-center' className='min-w-sm sm:min-w-lg' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('project.inviteMembers.title')}</DialogTitle>
          <DialogDescription>{t('project.inviteMembers.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form id='invite-members-form' onSubmit={handleFormSubmit}>
            <AsyncMultiSelectField<InviteMembersFormValues, InviteMemberItem, ComboboxUserItem>
              name='inviteMembers'
              items={userItems}
              isLoading={isLoadingUsers}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              label='project.inviteMembers.searchLabel'
              isRequired
              displayError={false}
              getId={(user) => user.id}
              getValueId={(item) => item.userId}
              getLabel={(user) => user.fullName}
              createValue={(user) => ({
                userId: user.id,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
                isEditor: false,
                inviteExpireDate: null
              })}
              renderOption={(user) => (
                <>
                  <Avatar className='size-8'>
                    <AvatarImage src={user.avatar ?? ''} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 overflow-hidden'>
                    <p className='text-sm font-medium truncate'>{user.fullName}</p>
                    <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                  </div>
                </>
              )}
              onChange={(val) => replace(val)}
            />

            <InviteMembersForm fields={fields} remove={remove} />

            <div className='rounded-md border border-dashed p-4 space-y-4 bg-muted/30 mt-4'>
              <Controller
                name='hasExpiration'
                control={control}
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal' data-invalid={fieldState.invalid}>
                    <FieldContent className='gap-0'>
                      <FieldLabel htmlFor={field.name}>
                        {t('project.inviteMembers.field.hasExpiration.label')}
                      </FieldLabel>
                      <FieldDescription className='text-xs'>
                        {t('project.inviteMembers.field.hasExpiration.description')}
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

              {hasExpiration && (
                <DatePickerField
                  control={control}
                  name='expirationDate'
                  label='project.inviteMembers.field.expirationDate.label'
                  placeholder='project.inviteMembers.field.expirationDate.placeholder'
                  displayError={false}
                  isRequired
                  minDate={addDays(new Date(), 1)}
                />
              )}
            </div>

            <Button type='submit' form='invite-members-form' className='w-full mt-4' disabled={isInvitingMembers}>
              {isInvitingMembers ? <Spinner /> : null}
              {t('common.button.invite')}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
