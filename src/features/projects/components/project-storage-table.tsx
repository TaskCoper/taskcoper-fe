import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDeleteAttachment } from '@/features/attachments/hooks/use-delete-attachment'
import { useDeleteProjectAttachment } from '@/features/attachments/hooks/use-delete-project-attachment'
import { useUploadProjectAttachment } from '@/features/attachments/hooks/use-upload-project-attachment'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { ProjectResource } from '@/types/project.type'
import type { AxiosError } from 'axios'
import { UploadIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFileAsync } = useUploadFile()
  const { uploadProjectAttachmentAsync } = useUploadProjectAttachment({ projectId })

  const { deleteAttachment } = useDeleteAttachment({ projectId })
  const { deleteProjectAttachment } = useDeleteProjectAttachment({ projectId })

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

  const onDeleteProjectResource = useCallback(
    async (resourceId: string) => {
      const confirmed = await confirm({
        title: t('projectStorage.deleteResource.title'),
        description: t('projectStorage.deleteResource.description'),
        confirmText: t('projectStorage.deleteResource.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        deleteProjectAttachment({ projectId, resourceId })
      }
    },
    [confirm, deleteProjectAttachment, projectId, t]
  )

  const handleUploadFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const toastId = toast.loading(t('common.ui.uploading'), {
          description: (
            <div className='w-full min-w-72 space-y-1'>
              <p className='text-xs text-muted-foreground truncate'>{file.name}</p>
              <Progress value={0} className='w-full' />
              <p className='text-xs text-muted-foreground'>0%</p>
            </div>
          )
        })

        try {
          const url = await uploadFileAsync({
            file,
            onProgress: (progress) => {
              toast.loading(t('common.ui.uploading'), {
                id: toastId,
                description: (
                  <div className='w-full min-w-72 space-y-1'>
                    <p className='text-xs text-muted-foreground truncate'>{file.name}</p>
                    <Progress value={progress} className='w-full' />
                    <p className='text-xs text-muted-foreground'>{progress}%</p>
                  </div>
                )
              })
            }
          })

          if (url) {
            await uploadProjectAttachmentAsync({
              body: {
                projectId,
                name: file.name,
                url,
                isUpload: true,
                storageKey: url,
                mimeType: file.type || 'application/octet-stream',
                bytes: file.size
              }
            })

            toast.success(t('common.ui.uploadSuccess'), {
              id: toastId,
              description: file.name
            })
          }
        } catch (error) {
          toast(t('error.somethingWentWrong'), {
            id: toastId,
            description: (error as AxiosError<ErrorResponse>).response?.data?.detail
          })
        }
      }
    },
    [projectId, t, uploadFileAsync, uploadProjectAttachmentAsync]
  )

  const columns = useMemo(
    () => getColumns({ onDeleteResource, onDeleteProjectResource }),
    [onDeleteResource, onDeleteProjectResource]
  )
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
        <input
          ref={fileInputRef}
          type='file'
          multiple
          className='hidden'
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUploadFiles(e.target.files)
              e.target.value = ''
            }
          }}
        />

        <Button size='sm' onClick={() => fileInputRef.current?.click()}>
          <UploadIcon />
          {t('projectStorage.uploadFile')}
        </Button>
      </DataTableToolbar>
    </DataTable>
  )
}
