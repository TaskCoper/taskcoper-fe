import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDeleteAttachment } from '@/features/attachments/hooks/use-delete-attachment'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { ProjectResource } from '@/types/project.type'
import i18next from 'i18next'
import { UploadIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetProjectMimeTypeStats } from '../hooks/use-get-project-mime-type-stats'
import { useGetProjectResourceMemberStats } from '../hooks/use-get-project-resource-member-stats'
import { useGetProjectResources } from '../hooks/use-get-project-resources'
import { formatMimeType } from '../utils'
import { getColumns } from './columns/project-resource-columns'

interface ProjectStorageTableProps {
  projectId: string
}

export default function ProjectStorageTable({ projectId }: ProjectStorageTableProps) {
  const { t } = useTranslation()
  const confirm = useConfirmStore((s) => s.confirm)
  const { deleteAttachment } = useDeleteAttachment({ projectId, parentMilestoneId: '' })

  const onDeleteResource = useCallback(
    async (resourceId: string, taskId: string) => {
      const confirmed = await confirm({
        title: t('projectStorage.deleteResource.title'),
        description: t('projectStorage.deleteResource.description'),
        confirmText: t('projectStorage.deleteResource.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        deleteAttachment({ id: resourceId, taskId })
      }
    },
    [confirm, deleteAttachment, t]
  )

  const columns = useMemo(() => getColumns({ onDeleteResource }), [onDeleteResource])
  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'storage'
  })

  const [nameFilter] = useQueryState('storage_name', parseAsString)
  const [dateFilter] = useQueryState('storage_createdOnUtc', parseAsArrayOf(parseAsString))
  const [memberIdFilter] = useQueryState('storage_memberId', parseAsArrayOf(parseAsString))
  const [mimeTypeFilter] = useQueryState('storage_mimeType', parseAsArrayOf(parseAsString))

  const name = nameFilter ?? undefined
  const date = dateFilter && dateFilter.length > 1 ? dateFilter : undefined
  const memberIds = memberIdFilter && memberIdFilter.length > 0 ? memberIdFilter : undefined
  const mimeTypes = mimeTypeFilter && mimeTypeFilter.length > 0 ? mimeTypeFilter : undefined

  const { projectResources, isLoadingProjectResources } = useGetProjectResources({
    projectId,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined,
    name,
    from: date?.[0],
    to: date?.[1],
    memberIds,
    mimeTypes
  })
  const { projectMimeTypeStats, isLoadingProjectMimeTypeStats } = useGetProjectMimeTypeStats({ projectId })
  const { projectResourceMemberStats, isLoadingProjectResourceMemberStats } = useGetProjectResourceMemberStats({
    projectId
  })

  const filterOptionOverrides = useMemo(() => {
    return {
      mimeType:
        projectMimeTypeStats?.value.items.map((item) => ({
          label: formatMimeType(item.mimeType),
          value: item.mimeType,
          count: item.totalResources
        })) ?? [],
      memberId:
        projectResourceMemberStats?.value.items.map((item) => ({
          label: `${item.firstName} ${item.lastName}`,
          value: item.id,
          count: item.totalResources
        })) ?? []
    }
  }, [projectMimeTypeStats, projectResourceMemberStats])

  const { table } = useDataTable({
    data: projectResources?.value?.items ?? [],
    columns,
    pageCount: Math.ceil((projectResources?.value?.totalCount ?? 0) / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<ProjectResource>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'storage_page',
      perPage: 'storage_perPage',
      sort: 'storage_sort'
    },
    filterPrefix: 'storage'
  })

  const isLoading = isLoadingProjectResources || isLoadingProjectMimeTypeStats || isLoadingProjectResourceMemberStats

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
        <Button size='sm'>
          <UploadIcon />
          {i18next.t('projectStorage.uploadFile')}
        </Button>
      </DataTableToolbar>
    </DataTable>
  )
}
