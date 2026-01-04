import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import { type FieldArrayWithId, type UseFieldArrayRemove } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateProjectFormValues } from '../validations'

interface UpdateProjectDomainsFormProps {
  fields: FieldArrayWithId<UpdateProjectFormValues, 'domainIds'>[]
  remove: UseFieldArrayRemove
}

export default function UpdateProjectDomainsForm({ fields, remove }: UpdateProjectDomainsFormProps) {
  const { t } = useTranslation()

  if (fields.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col gap-2 mt-4 max-h-60 overflow-y-auto'>
      <p className='text-sm font-medium text-muted-foreground'>
        {t('project.updateProjectDomains.selectedDomains')} ({fields.length})
      </p>

      <div className='space-y-2'>
        {fields.map((field, index) => (
          <div key={field.id} className='flex items-center justify-between gap-3'>
            <p className='text-sm font-medium'>{field.name}</p>

            <Button variant='ghost' size='icon-sm' onClick={() => remove(index)}>
              <XIcon />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
