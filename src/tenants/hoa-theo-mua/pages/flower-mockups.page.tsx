import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { AlertCircleIcon, PlusIcon, RotateCcwIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import ChangeFloralMockupStatusDialog from '../features/floral-mockups/components/change-floral-mockup-status-dialog'
import CreateFloralMockupDialog from '../features/floral-mockups/components/create-floral-mockup-dialog'
import DeleteFloralMockupDialog from '../features/floral-mockups/components/delete-floral-mockup-dialog'
import { getFloralMockupColumns } from '../features/floral-mockups/components/floral-mockup-columns'
import FloralMockupDetailDialog from '../features/floral-mockups/components/floral-mockup-detail-dialog'
import { useGetFloralMockups } from '../features/floral-mockups/hooks/use-get-floral-mockups'
import type { FloralMockupListItem } from '../features/floral-mockups/types'

const FILTER_PREFIX = 'floralMockups'
const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50]

export default function FlowerMockupsPage() {
  const { t } = useTenantTranslation()
  const [previewMockup, setPreviewMockup] = useState<FloralMockupListItem | null>(null)
  const [detailMockup, setDetailMockup] = useState<FloralMockupListItem | null>(null)
  const [statusMockup, setStatusMockup] = useState<FloralMockupListItem | null>(null)
  const [deletingMockup, setDeletingMockup] = useState<FloralMockupListItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const columns = useMemo(
    () =>
      getFloralMockupColumns({
        t,
        onPreview: setPreviewMockup,
        onViewDetail: setDetailMockup,
        onToggleStatus: setStatusMockup,
        onDelete: setDeletingMockup
      }),
    [t]
  )
  const { page, limit } = useTableQueryParams({ columns, prefix: FILTER_PREFIX, limit: 10 })
  const [searchFilter] = useQueryState(`${FILTER_PREFIX}_name`, parseAsString)
  const [statusFilter] = useQueryState(`${FILTER_PREFIX}_isActive`, parseAsString)
  const activeStatus = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined
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
    isActive: activeStatus
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
          <DataTable table={table} isLoading={isGettingFloralMockups} pageSizeOptions={PAGE_SIZE_OPTIONS}>
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
      <ChangeFloralMockupStatusDialog
        mockup={statusMockup}
        open={Boolean(statusMockup)}
        onOpenChange={(open) => {
          if (!open) setStatusMockup(null)
        }}
      />
      <CreateFloralMockupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={() => table.setPageIndex(0)}
      />
      <DeleteFloralMockupDialog
        mockup={deletingMockup}
        open={Boolean(deletingMockup)}
        onOpenChange={(open) => {
          if (!open) setDeletingMockup(null)
        }}
        onDeleted={() => {
          if (table.getRowModel().rows.length === 1 && table.getState().pagination.pageIndex > 0) {
            table.previousPage()
          }
        }}
      />
    </div>
  )
}
