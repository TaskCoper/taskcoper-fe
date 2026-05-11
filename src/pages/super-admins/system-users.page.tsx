import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useGetDomainStats } from '@/features/domains/hooks/use-get-domain-stats'
import { getColumns } from '@/features/users/components/columns/system-user-columns'
import { useGetUsers } from '@/features/users/hooks/use-get-users'
import type { User } from '@/features/users/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useGetOrgStats } from '@/hooks/use-get-org-stats'
import { useGetRoleStats } from '@/hooks/use-get-role-stats'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusCircleIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'

export default function SystemUsersPage() {
  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'users'
  })

  const [nameFilter] = useQueryState('users_name', parseAsString)
  const [orgIdsFilter] = useQueryState('users_organizationId', parseAsArrayOf(parseAsString))
  const [domainIdsFilter] = useQueryState('users_domainId', parseAsArrayOf(parseAsString))
  const [rolesFilter] = useQueryState('users_role', parseAsArrayOf(parseAsString))

  const name = nameFilter ?? undefined
  const orgIds = orgIdsFilter && orgIdsFilter.length > 0 ? orgIdsFilter : undefined
  const domainIds = domainIdsFilter && domainIdsFilter.length > 0 ? domainIdsFilter : undefined
  const roles = rolesFilter && rolesFilter.length > 0 ? rolesFilter : undefined

  const { users, isLoadingUsers } = useGetUsers({
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined,
    searchTerm: name,
    organizationId: orgIds,
    domainId: domainIds,
    roles
  })
  const { orgStats, isLoadingOrgStats } = useGetOrgStats()
  const { domainStats, isLoadingDomainStats } = useGetDomainStats()
  const { roleStats, isLoadingRoleStats } = useGetRoleStats()

  const filterOptionOverrides = useMemo(() => {
    return {
      organizationId: orgStats.map((org) => ({
        value: org.organizationId,
        label: org.organizationName,
        count: org.totalUsers
      })),
      domainId: domainStats.map((domain) => ({
        value: domain.domainId,
        label: domain.domainName,
        count: domain.totalUsers
      })),
      role: roleStats.map((role) => ({
        value: role.roleName,
        label: role.roleName,
        count: role.totalUsers
      }))
    }
  }, [orgStats, domainStats, roleStats])

  const { table } = useDataTable({
    data: users.value.items,
    columns,
    pageCount: Math.ceil(users.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<User>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false
      }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'users_page',
      perPage: 'users_perPage',
      sort: 'users_sort'
    },
    filterPrefix: 'users'
  })

  const isLoading = isLoadingUsers || isLoadingOrgStats || isLoadingDomainStats || isLoadingRoleStats

  return (
    <div className='px-4 pt-2'>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
          <Button size='sm'>
            <PlusCircleIcon />
            Tạo người dùng
          </Button>
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
