import MultiSelectField from '@/components/multi-select-field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { cn, getAvatarFallback } from '@/shared/utils'
import { XIcon } from 'lucide-react'
import { Controller, useFormContext, type FieldArrayWithId, type UseFieldArrayRemove } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { ProjectRoleItem } from '../../roles/types'
import type { InviteMembersFormValues } from '../validations'

interface InviteMembersFormProps {
  fields: FieldArrayWithId<InviteMembersFormValues, 'inviteMembers'>[]
  remove: UseFieldArrayRemove
  roles?: ProjectRoleItem[]
}

export default function InviteMembersForm({ fields, remove, roles = [] }: InviteMembersFormProps) {
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
                name={`inviteMembers.${index}.roleIds`}
                render={({ fieldState, field }) => (
                  <Field data-invalid={fieldState.invalid} className='w-fit min-w-50'>
                    <MultiSelectField
                      name={field.name}
                      label=''
                      options={roles.map((role) => ({
                        label: role.name,
                        value: role.id,
                        meta: { isSystem: role.isSystem, isDefault: role.isDefault, name: role.name }
                      }))}
                      value={field.value ?? []}
                      onValueChange={field.onChange}
                      placeholder='project.updateProjectMembers.column.role'
                      triggerClassName={cn('h-8', field.value.length > 0 ? 'px-1!' : 'px-2!')}
                      displayError={false}
                      customBadgeRender={(option) => {
                        return (
                          <div className='flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm border'>
                            <p className='text-xs font-semibold'>{option.label}</p>
                          </div>
                        )
                      }}
                    />
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
