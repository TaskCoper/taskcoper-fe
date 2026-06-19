import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { getColumns } from '../features/job-descriptions/components/job-description-columns'
import { useGetJobDescriptions } from '../features/job-descriptions/hooks/use-get-job-descriptions'
import type { JobDescription } from '../features/job-descriptions/types'

export default function RecruitmentJobsPage() {
  const { t } = useTenantTranslation()

  const columns = useMemo(() => getColumns({ t }), [t])
  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'job_descriptions'
  })

  const [titleFilter] = useQueryState('job_descriptions_title', parseAsString)
  const [employmentTypeFilter] = useQueryState('job_descriptions_employmentType', parseAsInteger)
  const [statusFilter] = useQueryState('job_descriptions_status', parseAsInteger)

  const title = titleFilter ?? undefined
  const employmentType = employmentTypeFilter ?? undefined
  const status = statusFilter ?? undefined

  const { jobDescriptions, isLoadingJobDescriptions } = useGetJobDescriptions({
    page,
    pageSize: limit,
    title,
    employmentType,
    status
  })

  const { table } = useDataTable({
    data: jobDescriptions.value.items,
    columns,
    pageCount: Math.ceil(jobDescriptions.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<JobDescription>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false,
        memberIds: false
      }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'job_descriptions_page',
      perPage: 'job_descriptions_perPage',
      sort: 'job_descriptions_sort'
    },
    filterPrefix: 'job_descriptions'
  })

  const isLoading = isLoadingJobDescriptions

  return (
    <div className='p-6 space-y-6'>
      <div>
        <p className='text-2xl font-bold'>{t('recruitment.jobs.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('recruitment.jobs.description')}</p>
      </div>

      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table}></DataTableToolbar>
      </DataTable>
    </div>
  )
}
