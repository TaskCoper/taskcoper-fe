import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { AlertCircleIcon, PlusIcon, RotateCcwIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import CreateFloralMockupDialog from '../features/floral-mockups/components/create-floral-mockup-dialog'
import { getFloralMockupColumns } from '../features/floral-mockups/components/floral-mockup-columns'
import FloralMockupDetailDialog from '../features/floral-mockups/components/floral-mockup-detail-dialog'
import { useChangeFloralMockupStatus } from '../features/floral-mockups/hooks/use-change-floral-mockup-status'
import { useDeleteFloralMockup } from '../features/floral-mockups/hooks/use-delete-floral-mockup'
import { useGetFloralMockups } from '../features/floral-mockups/hooks/use-get-floral-mockups'
import { FlowerReferenceType, type FloralMockupListItem } from '../features/floral-mockups/types'

const FILTER_PREFIX = 'floralMockups'

export default function FlowerMockupsPage() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const { changeFloralMockupStatus } = useChangeFloralMockupStatus()
  const { deleteFloralMockup } = useDeleteFloralMockup()
  const [previewMockup, setPreviewMockup] = useState<FloralMockupListItem | null>(null)
  const [detailMockup, setDetailMockup] = useState<FloralMockupListItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleToggleStatus = useCallback(
    async (mockup: FloralMockupListItem) => {
      const isActive = !mockup.isActive
      const action = isActive ? 'activate' : 'deactivate'
      const confirmed = await confirm({
        title: t(`floralMockups.statusAction.${action}Title`),
        description: t(`floralMockups.statusAction.${action}Description`, { name: mockup.name }),
        confirmText: t(`floralMockups.statusAction.${action}Confirm`)
      })

      if (confirmed) changeFloralMockupStatus({ id: mockup.id, isActive })
    },
    [changeFloralMockupStatus, confirm, t]
  )

  const handleDelete = useCallback(
    async (mockup: FloralMockupListItem) => {
      const confirmed = await confirm({
        title: t('floralMockups.deleteAction.title'),
        description: t('floralMockups.deleteAction.description', { name: mockup.name }),
        confirmText: t('floralMockups.deleteAction.confirm'),
        variant: 'destructive'
      })

      if (confirmed) deleteFloralMockup({ id: mockup.id })
    },
    [confirm, deleteFloralMockup, t]
  )

  const columns = useMemo(
    () =>
      getFloralMockupColumns({
        t,
        onPreview: setPreviewMockup,
        onViewDetail: setDetailMockup,
        onToggleStatus: handleToggleStatus,
        onDelete: handleDelete
      }),
    [handleDelete, handleToggleStatus, t]
  )
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX, limit: 10 })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_name`, parseAsString)
  const [statusFilter] = useQueryState(`${FILTER_PREFIX}_isActive`, parseAsString)
  const [typeFilter] = useQueryState(`${FILTER_PREFIX}_type`, parseAsString)
  const activeStatus = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined
  const referenceType = Object.values(FlowerReferenceType).includes(typeFilter as FlowerReferenceType)
    ? (typeFilter as FlowerReferenceType)
    : undefined
  const {
    floralMockups,
    isGettingFloralMockups,
    isFetchingFloralMockups,
    isGetFloralMockupsError,
    refetchFloralMockups
  } = useGetFloralMockups({
    pageIndex: page,
    pageSize: limit,
    search: searchFilter?.trim() || undefined,
    isActive: activeStatus,
    type: referenceType
  })

  const { table } = useDataTable({
    data: floralMockups?.items ?? [],
    columns,
    pageCount: Math.ceil((floralMockups?.totalCount ?? 0) / limit) || 1,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    filterPrefix: FILTER_PREFIX,
    queryKeys: {
      page: `${FILTER_PREFIX}_page`,
      perPage: `${FILTER_PREFIX}_perPage`,
      sort: `${FILTER_PREFIX}_sort`
    }
  })

  return (
    <div className='h-full overflow-auto'>
      <div className='space-y-6 p-6'>
        <div>
          <h1 className='text-2xl font-bold'>{t('floralMockups.title')}</h1>
          <p className='text-sm text-muted-foreground'>{t('floralMockups.description')}</p>
        </div>

        {isGetFloralMockupsError ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-20 text-center'>
            <AlertCircleIcon className='size-10 text-destructive/60' aria-hidden='true' />
            <div className='space-y-1'>
              <p className='text-sm font-medium'>{t('floralMockups.loadFailed')}</p>
              <p className='text-sm text-muted-foreground'>{t('floralMockups.loadFailedDescription')}</p>
            </div>
            <Button
              type='button'
              variant='outline'
              disabled={isFetchingFloralMockups}
              onClick={() => void refetchFloralMockups()}
            >
              {isFetchingFloralMockups ? <Spinner /> : <RotateCcwIcon />}
              {t('floralMockups.retry')}
            </Button>
          </div>
        ) : (
          <DataTable table={table} isLoading={isGettingFloralMockups}>
            <DataTableToolbar table={table}>
              <Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon />
                {t('floralMockups.form.add')}
              </Button>
            </DataTableToolbar>
          </DataTable>
        )}
      </div>

      {previewMockup?.imageUrl && (
        <Lightbox
          open
          close={() => setPreviewMockup(null)}
          slides={[
            {
              src: previewMockup.imageUrl,
              alt: t('floralMockups.previewAlt', { name: previewMockup.name })
            }
          ]}
          carousel={{ finite: true }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      )}

      <FloralMockupDetailDialog
        mockup={detailMockup}
        open={Boolean(detailMockup)}
        onOpenChange={(open) => {
          if (!open) setDetailMockup(null)
        }}
        onPreview={setPreviewMockup}
      />
      <CreateFloralMockupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={() => table.setPageIndex(0)}
      />
    </div>
  )
}
