import AsyncMultiSelectField from '@/components/async-multi-select-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useGetDomains } from '@/features/domains/hooks/use-get-domains'
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'
import type { DomainItem, UpdateProjectFormValues } from '../../validations'
import UpdateProjectDomainsForm from '../forms/update-project-domains-form'

interface UpdateProjectDomainsDialogProps {
  children: React.ReactNode
  isPending: boolean
}

interface ComboboxDomainItem {
  id: string
  name: string
}

export default function UpdateProjectDomainsDialog({ children, isPending }: UpdateProjectDomainsDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const {
    reset,
    control,
    formState: { isDirty }
  } = useFormContext<UpdateProjectFormValues>()

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchQuery] = useDebounce(searchTerm, 500)

  const { domains, isLoadingDomains } = useGetDomains({
    searchTerm: debouncedSearchQuery || undefined,
    enabled: open
  })

  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'domainIds'
  })

  const domainItems: ComboboxDomainItem[] = domains.value.items.map((d) => ({
    id: d.id,
    name: d.name
  }))

  const onClose = () => {
    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='min-w-md' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('project.updateProjectDomains.title')}</DialogTitle>
          <DialogDescription>{t('project.updateProjectDomains.description')}</DialogDescription>
        </DialogHeader>

        <div>
          <AsyncMultiSelectField<UpdateProjectFormValues, DomainItem, ComboboxDomainItem>
            name='domainIds'
            items={domainItems}
            isLoading={isLoadingDomains}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            label='project.updateProjectDomains.searchLabel'
            isRequired
            displayError={false}
            getId={(domain) => domain.id}
            getValueId={(item) => item.id}
            getLabel={(domain) => domain.name}
            createValue={(domain) => ({
              id: domain.id,
              name: domain.name
            })}
            renderOption={(domain) => <p>{domain.name}</p>}
            onChange={(val) => replace(val)}
          />

          <UpdateProjectDomainsForm fields={fields} remove={remove} />
        </div>

        <div className='flex items-center justify-end gap-2'>
          <Button variant='ghost' type='button' onClick={onClose} disabled={isPending}>
            {t('common.button.cancel')}
          </Button>
          <Button type='submit' form='update-project-info-form' disabled={!isDirty || isPending}>
            {isPending ? <Spinner /> : null}
            {t('common.button.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
