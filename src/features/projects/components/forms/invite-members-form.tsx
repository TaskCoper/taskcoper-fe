import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAvatarFallback } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { Controller, useFormContext, type FieldArrayWithId, type UseFieldArrayRemove } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { InviteMembersFormValues } from '../../validations'

interface InviteMembersFormProps {
  fields: FieldArrayWithId<InviteMembersFormValues, 'inviteMembers'>[]
  remove: UseFieldArrayRemove
}

export default function InviteMembersForm({ fields, remove }: InviteMembersFormProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<InviteMembersFormValues>()

  if (fields.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col gap-3 mt-4 max-h-60 overflow-y-auto'>
      <p className='text-sm font-medium text-muted-foreground'>
        {t('project.inviteMembers.invitedUsers')} ({fields.length})
      </p>

      <div className='space-y-2'>
        {fields.map((field, index) => (
          <div key={field.id} className='flex items-center gap-3'>
            <Avatar className='size-9'>
              <AvatarImage src={field.avatar ?? ''} />
              <AvatarFallback>{getAvatarFallback(field.fullName)}</AvatarFallback>
            </Avatar>

            <div className='flex-1 w-32'>
              <p className='text-sm font-medium truncate'>{field.fullName || field.email}</p>
              {field.fullName && <p className='text-xs text-muted-foreground truncate'>{field.email}</p>}
            </div>

            <div className='flex items-center gap-1'>
              <Controller
                control={control}
                name={`inviteMembers.${index}.isEditor`}
                render={({ fieldState, field }) => (
                  <Field data-invalid={fieldState.invalid} className='w-fit'>
                    <Select
                      name={field.name}
                      value={field.value ? 'edit' : 'view'}
                      onValueChange={(val) => field.onChange(val === 'edit')}
                    >
                      <SelectTrigger size='sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='view'>{t('common.ui.viewOnly')}</SelectItem>
                        <SelectItem value='edit'>{t('common.ui.canEdit')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Button variant='ghost' size='icon-sm' onClick={() => remove(index)}>
                <XIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
