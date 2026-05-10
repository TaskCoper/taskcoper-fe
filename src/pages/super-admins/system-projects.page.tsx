import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { getColumns } from '@/features/projects/core/components/system-project-columns'
import { useGetProjects } from '@/features/projects/core/hooks/use-get-projects'
import type { SystemProject } from '@/features/projects/core/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useGetDomainStats } from '@/hooks/use-get-domain-stats'
import { useGetOrgStats } from '@/hooks/use-get-org-stats'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusCircleIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function SystemProjectsPage() {
  const { t } = useTranslation()
  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'projects'
  })

  const [nameFilter] = useQueryState('projects_name', parseAsString)
  const [startDateFilter] = useQueryState('projects_startDate', parseAsString)
  const [endDateFilter] = useQueryState('projects_endDate', parseAsString)
  const [orgIdsFilter] = useQueryState('projects_organizationId', parseAsArrayOf(parseAsString))
  const [domainIdsFilter] = useQueryState('projects_domainId', parseAsArrayOf(parseAsString))

  const name = nameFilter ?? undefined
  const startDate = startDateFilter ?? undefined
  const endDate = endDateFilter ?? undefined
  const orgIds = orgIdsFilter && orgIdsFilter.length > 0 ? orgIdsFilter : undefined
  const domainIds = domainIdsFilter && domainIdsFilter.length > 0 ? domainIdsFilter : undefined

  const { projects, isLoadingProjects } = useGetProjects({
    pageIndex: page,
    pageSize: limit,
    searchTerm: name,
    startDate,
    endDate,
    organizationId: orgIds,
    domainId: domainIds,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined
  })

  const { orgStats, isLoadingOrgStats } = useGetOrgStats()
  const { domainStats, isLoadingDomainStats } = useGetDomainStats()

  const filterOptionOverrides = useMemo(() => {
    return {
      organizationId: orgStats.map((org) => ({
        value: org.organizationId,
        label: org.organizationName,
        count: org.totalProjects
      })),
      domainId: domainStats.map((domain) => ({
        value: domain.domainId,
        label: domain.domainName,
        count: domain.totalProjects
      }))
    }
  }, [orgStats, domainStats])

  const { table } = useDataTable({
    data: projects.value.items,
    columns,
    pageCount: Math.ceil(projects.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<SystemProject>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false
      }
    },
    getRowId: ({ projectId }) => projectId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'projects_page',
      perPage: 'projects_perPage',
      sort: 'projects_sort'
    },
    filterPrefix: 'projects'
  })

  const isLoading = isLoadingProjects || isLoadingOrgStats || isLoadingDomainStats

  return (
    <div className='px-4 pt-2'>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
          <Button size='sm'>
            <PlusCircleIcon />
            {t('systemProjects.createProject')}
          </Button>
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
