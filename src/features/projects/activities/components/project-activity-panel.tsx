import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetProjectMembers } from '@/features/projects/members/hooks/use-get-project-members'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetProjectActivities } from '../hooks/use-get-project-activities'
import type { ProjectActivity } from '../types'
import { getColumns } from './project-activity-columns'

const ALL_ACTORS = 'all'

interface ProjectActivityPanelProps {
  projectIdentifier?: string
}

export default function ProjectActivityPanel({ projectIdentifier }: ProjectActivityPanelProps) {
  const { t } = useTranslation()

  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'activity'
  })

  const [searchFilter] = useQueryState('activity_searchTerm', parseAsString)
  const [dateFilter] = useQueryState('activity_occurredOnUtc', parseAsArrayOf(parseAsString))
  const [actorFilter, setActorFilter] = useQueryState('activity_actorUserId', parseAsString)

  const searchTerm = searchFilter ?? undefined
  const date = dateFilter && dateFilter.length > 1 ? dateFilter : undefined
  const actorUserId = actorFilter && actorFilter !== ALL_ACTORS ? actorFilter : undefined

  const { members } = useGetProjectMembers({ identifier: projectIdentifier, pageSize: 100 })
  const memberItems = members?.value.items ?? []

  const { projectActivities, isLoadingProjectActivities } = useGetProjectActivities({
    projectIdentifier,
    pageIndex: page,
    pageSize: limit,
    searchTerm,
    from: date?.[0],
    to: date?.[1],
    actorUserId
  })

  const { table } = useDataTable({
    data: projectActivities?.value.items ?? [],
    columns,
    pageCount: Math.ceil((projectActivities?.value.totalCount ?? 0) / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<ProjectActivity>[]
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'activity_page',
      perPage: 'activity_perPage',
      sort: 'activity_sort'
    },
    filterPrefix: 'activity'
  })

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('project.activity.panelTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.activity.panelDescription')}</p>
      </div>

      <DataTable table={table} isLoading={isLoadingProjectActivities}>
        <DataTableToolbar table={table}>
          <Select
            value={actorFilter ?? ALL_ACTORS}
            onValueChange={(value) => setActorFilter(value === ALL_ACTORS ? null : value)}
          >
            <SelectTrigger className='h-8 w-44'>
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
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
