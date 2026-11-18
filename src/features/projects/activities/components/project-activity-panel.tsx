import { DateRangePickerField, type IsoDateRangeValue } from '@/components/date-range-picker-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetProjectMembers } from '@/features/projects/members/hooks/use-get-project-members'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useGetProjectActivities } from '../hooks/use-get-project-activities'
import ProjectActivityRow from './project-activity-row'

interface ProjectActivityPanelProps {
  projectIdentifier?: string
}

const ALL_ACTORS = 'all'

interface ActivityFilterForm {
  dateRange: IsoDateRangeValue
}

export default function ProjectActivityPanel({ projectIdentifier }: ProjectActivityPanelProps) {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [actorUserId, setActorUserId] = useState<string>(ALL_ACTORS)
  const [pageIndex, setPageIndex] = useState(1)

  const methods = useForm<ActivityFilterForm>({ defaultValues: { dateRange: null } })
  const dateRange = useWatch({ control: methods.control, name: 'dateRange' })

  const { members } = useGetProjectMembers({ identifier: projectIdentifier, pageSize: 100 })
  const memberItems = members?.value.items ?? []

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value)
    setPageIndex(1)
  }, 400)

  const { projectActivities, isLoadingProjectActivities } = useGetProjectActivities({
    projectIdentifier,
    pageIndex,
    pageSize: 20,
    searchTerm: searchTerm.trim() || undefined,
    from: dateRange?.from ?? undefined,
    to: dateRange?.to ?? undefined,
    actorUserId: actorUserId === ALL_ACTORS ? undefined : actorUserId
  })

  const items = projectActivities?.value.items ?? []
  const hasNextPage = projectActivities?.value.hasNextPage ?? false

  return (
    <div className='max-w-4xl space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
        <div className='flex-1'>
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              debouncedSearch(e.target.value)
            }}
            placeholder={t('project.activity.searchPlaceholder')}
            className='bg-background'
          />
        </div>

        <FormProvider {...methods}>
          <DateRangePickerField<ActivityFilterForm>
            name='dateRange'
            control={methods.control}
            label={t('project.activity.dateRange')}
            displayError={false}
            className='w-full sm:w-64'
          />
        </FormProvider>

        <Select
          value={actorUserId}
          onValueChange={(value) => {
            setActorUserId(value)
            setPageIndex(1)
          }}
        >
          <SelectTrigger className='w-full bg-background sm:w-52'>
            <SelectValue placeholder={t('project.activity.allActors')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACTORS}>{t('project.activity.allActors')}</SelectItem>
            {memberItems.map((member) => (
              <SelectItem key={member.userId} value={member.userId}>
                {member.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoadingProjectActivities ? (
        <div className='space-y-3'>
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
          <Skeleton className='h-10' />
        </div>
      ) : items.length === 0 ? (
        <p className='py-10 text-center text-sm text-muted-foreground'>{t('project.activity.empty')}</p>
      ) : (
        <div className='space-y-5'>
          {items.map((activity) => (
            <ProjectActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {(pageIndex > 1 || hasNextPage) && (
        <div className='flex items-center justify-end gap-2 pt-2'>
          <Button
            variant='outline'
            size='icon-sm'
            disabled={pageIndex <= 1}
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <Button variant='outline' size='icon-sm' disabled={!hasNextPage} onClick={() => setPageIndex((p) => p + 1)}>
            <ChevronRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
