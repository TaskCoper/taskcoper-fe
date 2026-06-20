import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsBoolean, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { getColumns } from '../features/recruitment-requests/components/recruitment-request-columns'
import { useGetRecruitmentRequests } from '../features/recruitment-requests/hooks/use-get-recruitment-requests'
import type { RecruitmentRequest } from '../features/recruitment-requests/types'

export default function RecruitmentApplicantsPage() {
  const { t } = useTenantTranslation()

  const columns = useMemo(() => getColumns({ t }), [t])
  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'applicants'
  })

  const [isReadFilter] = useQueryState('applicants_isRead', parseAsBoolean)
  const isRead = isReadFilter ?? undefined

  const { recruitmentRequests, isLoadingRecruitmentRequests } = useGetRecruitmentRequests({
    page,
    pageSize: limit,
    isRead
  })

  const { table } = useDataTable({
    data: recruitmentRequests.value.items,
    columns,
    pageCount: Math.ceil(recruitmentRequests.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<RecruitmentRequest>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'applicants_page',
      perPage: 'applicants_perPage',
      sort: 'applicants_sort'
    },
    filterPrefix: 'applicants'
  })

  return (
    <div className='p-6 space-y-6'>
      <div>
        <p className='text-2xl font-bold'>{t('recruitment.applicants.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('recruitment.applicants.description')}</p>
      </div>

      <DataTable table={table} isLoading={isLoadingRecruitmentRequests}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  )
}
