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
import { useGetProjectAuditLogs } from '../hooks/use-get-project-audit-logs'
import type { AuditLog } from '../types'
import { getColumns } from './audit-log-columns'

const ALL_ACTORS = 'all'
const ALL_ENTITIES = 'all'
const ENTITY_TYPES = ['Project', 'ProjectRole', 'ProjectMember'] as const

interface AuditLogPanelProps {
  projectIdentifier?: string
}

export default function AuditLogPanel({ projectIdentifier }: AuditLogPanelProps) {
  const { t } = useTranslation()

  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'audit'
  })

  const [searchFilter] = useQueryState('audit_searchTerm', parseAsString)
  const [dateFilter] = useQueryState('audit_occurredOnUtc', parseAsArrayOf(parseAsString))
  const [actorFilter, setActorFilter] = useQueryState('audit_actorUserId', parseAsString)
  const [entityFilter, setEntityFilter] = useQueryState('audit_entityType', parseAsString)

  const searchTerm = searchFilter ?? undefined
  const date = dateFilter && dateFilter.length > 1 ? dateFilter : undefined
  const actorUserId = actorFilter && actorFilter !== ALL_ACTORS ? actorFilter : undefined
  const entityType = entityFilter && entityFilter !== ALL_ENTITIES ? entityFilter : undefined

  const { members } = useGetProjectMembers({ identifier: projectIdentifier, pageSize: 100 })
  const memberItems = members?.value.items ?? []

  const { projectAuditLogs, isLoadingProjectAuditLogs } = useGetProjectAuditLogs({
    projectIdentifier,
    pageIndex: page,
    pageSize: limit,
    searchTerm,
    from: date?.[0],
    to: date?.[1],
    actorUserId,
    entityType
  })

  const { table } = useDataTable({
    data: projectAuditLogs?.value.items ?? [],
    columns,
    pageCount: Math.ceil((projectAuditLogs?.value.totalCount ?? 0) / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<AuditLog>[]
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'audit_page',
      perPage: 'audit_perPage',
      sort: 'audit_sort'
    },
    filterPrefix: 'audit'
  })

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('project.auditLog.panelTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.auditLog.panelDescription')}</p>
      </div>

      <DataTable table={table} isLoading={isLoadingProjectAuditLogs}>
        <DataTableToolbar table={table}>
          <Select
            value={entityFilter ?? ALL_ENTITIES}
            onValueChange={(value) => setEntityFilter(value === ALL_ENTITIES ? null : value)}
          >
            <SelectTrigger className='h-8 w-44'>
              <SelectValue placeholder={t('project.auditLog.allEntities')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ENTITIES}>{t('project.auditLog.allEntities')}</SelectItem>
              {ENTITY_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`project.auditLog.entities.${value}`, { defaultValue: value })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={actorFilter ?? ALL_ACTORS}
            onValueChange={(value) => setActorFilter(value === ALL_ACTORS ? null : value)}
          >
            <SelectTrigger className='h-8 w-44'>
              <SelectValue placeholder={t('project.auditLog.allActors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ACTORS}>{t('project.auditLog.allActors')}</SelectItem>
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
