import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import type { ErrorResponse } from '@/lib/axios'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { isAxiosError } from 'axios'
import { Download, Plus, X } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import EditorSection from '../../configs/components/shared/editor-section'
import { downloadExportFile } from '../download-export-file'
import { getErrorDescription } from '../error-description'
import {
  useCreateVoucher,
  useCreateVoucherProgram,
  useDeleteVoucher,
  useDeleteVoucherProgram,
  useGenerateVouchers,
  useGetVoucherPrograms,
  useGetVoucherUsages,
  useGetVouchers,
  useToggleVoucher,
  useToggleVoucherProgram,
  useUpdateVoucherProgram,
  useUpdateVouchers
} from '../hooks'
import type { Voucher, VoucherProgram, VoucherUsage, VoucherVisibility } from '../types'
import { GenerateDialog } from './generate-voucher-dialog'
import { ProgramFormDialog } from './program-form-dialog'
import { getVoucherColumns } from './voucher-columns'
import { VoucherDetailDialog } from './voucher-detail-dialog'
import { VoucherFormDialog } from './voucher-form-dialog'
import { getVoucherProgramColumns } from './voucher-program-columns'
import { getVoucherUsageColumns } from './voucher-usage-columns'
export { GenerateDialog } from './generate-voucher-dialog'

type View = 'vouchers' | 'programs'

const MAX_EXPORT_PROGRAMS = 50

export default function VouchersEditor({ view }: { view: View }) {
  const { t } = useTenantTranslation()
  const navigate = useNavigate()
  const { confirm } = useConfirmStore()
  const [keyword] = useQueryState('vouchers_code', parseAsString)
  const [programKeyword] = useQueryState('voucher_programs_name', parseAsString)
  const [visibilityFilter] = useQueryState('vouchers_visibility', parseAsString)
  const visibility: VoucherVisibility | undefined =
    visibilityFilter === 'public' || visibilityFilter === 'private' ? visibilityFilter : undefined
  const [voucherPage] = useQueryState('vouchers_page', parseAsInteger)
  const [voucherPerPage] = useQueryState('vouchers_perPage', parseAsInteger)
  const [programPage] = useQueryState('voucher_programs_page', parseAsInteger)
  const [programPerPage] = useQueryState('voucher_programs_perPage', parseAsInteger)
  const [dialog, setDialog] = useState<'voucher' | 'program' | 'generate' | null>(null)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null)
  const [editingProgram, setEditingProgram] = useState<VoucherProgram | null>(null)
  const [generateProgram, setGenerateProgram] = useState<VoucherProgram | null>(null)
  const [usageVoucherId, setUsageVoucherId] = useState<string | null>(null)
  const [usagePage, setUsagePage] = useQueryState('voucher_usages_page', parseAsInteger)
  const [usagePerPage] = useQueryState('voucher_usages_perPage', parseAsInteger)
  const voucherParams = useMemo(
    () => ({
      pageIndex: Math.max(voucherPage ?? 1, 1),
      pageSize: voucherPerPage ?? DEFAULT_PAGE_SIZE,
      keyword: keyword || undefined,
      visibility
    }),
    [keyword, voucherPage, voucherPerPage, visibility]
  )
  const programParams = useMemo(
    () => ({
      pageIndex: programPage ?? 1,
      pageSize: programPerPage ?? DEFAULT_PAGE_SIZE,
      keyword: programKeyword || undefined,
      isDelete: false
    }),
    [programKeyword, programPage, programPerPage]
  )
  const { vouchers } = useGetVouchers(voucherParams)
  const { programs } = useGetVoucherPrograms(programParams)
  const { usages } = useGetVoucherUsages(usageVoucherId, {
    pageIndex: usagePage ?? 1,
    pageSize: usagePerPage ?? DEFAULT_PAGE_SIZE
  })
  const { createVoucher, isCreatingVoucher } = useCreateVoucher()
  const { updateVouchers, isUpdatingVouchers } = useUpdateVouchers()
  const { deleteVoucher, isDeletingVoucher } = useDeleteVoucher()
  const { createVoucherProgram, isCreatingVoucherProgram } = useCreateVoucherProgram()
  const { updateVoucherProgram, isUpdatingVoucherProgram } = useUpdateVoucherProgram()
  const { toggleVoucher } = useToggleVoucher()
  const { toggleVoucherProgram } = useToggleVoucherProgram()
  const { deleteVoucherProgram, isDeletingVoucherProgram } = useDeleteVoucherProgram()
  const { generateVouchers, isGeneratingVouchers } = useGenerateVouchers()
  const mutations = {
    createVoucher: { mutate: createVoucher, isPending: isCreatingVoucher },
    updateVouchers: { mutate: updateVouchers, isPending: isUpdatingVouchers },
    deleteVoucher: { mutate: deleteVoucher, isPending: isDeletingVoucher },
    createProgram: { mutate: createVoucherProgram, isPending: isCreatingVoucherProgram },
    updateProgram: { mutate: updateVoucherProgram, isPending: isUpdatingVoucherProgram },
    deleteProgram: { mutate: deleteVoucherProgram, isPending: isDeletingVoucherProgram },
    generateVouchers: { mutate: generateVouchers, isPending: isGeneratingVouchers }
  }
  const voucherItems = vouchers.data?.items ?? []
  const programItems = programs.data?.items ?? []

  const requestDelete = useCallback(
    async (target: { type: 'voucher'; id: string } | { type: 'program'; id: string }) => {
      const isProgram = target.type === 'program'
      const confirmed = await confirm({
        title: t(
          isProgram ? 'configsPage.vouchers.deleteProgramConfirmTitle' : 'configsPage.vouchers.deleteConfirmTitle'
        ),
        description: t(
          isProgram
            ? 'configsPage.vouchers.deleteProgramConfirmDescription'
            : 'configsPage.vouchers.deleteConfirmDescription'
        ),
        confirmText: t('configsPage.vouchers.deleteConfirm'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (!confirmed) return

      if (target.type === 'program') {
        deleteVoucherProgram(target.id)
      } else {
        deleteVoucher(target.id)
      }
    },
    [confirm, deleteVoucher, deleteVoucherProgram, t]
  )

  const voucherColumns = useMemo(
    () =>
      getVoucherColumns({
        t,
        onEdit: (voucher) => {
          setEditingVoucher(voucher)
          setDialog('voucher')
        },
        onViewUsage: (voucher) => {
          void setUsagePage(null)
          setDetailVoucher(voucher)
          setUsageVoucherId(voucher.id)
        },
        onToggleActive: (voucher, isActive) => void toggleVoucher(voucher, isActive),
        onDelete: (id) => void requestDelete({ type: 'voucher', id })
      }),
    [requestDelete, setUsagePage, t, toggleVoucher]
  )
  const usageColumns = useMemo(() => getVoucherUsageColumns(t), [t])
  const programColumns = useMemo(
    () =>
      getVoucherProgramColumns({
        t,
        onViewDetail: (program) => navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs/${program.id}`),
        onToggleActive: (program, isActive) => void toggleVoucherProgram(program, isActive),
        onGenerate: (program) => {
          setGenerateProgram(program)
          setDialog('generate')
        },
        onEdit: (program) => {
          setEditingProgram(program)
          setDialog('program')
        },
        onDelete: (program) => void requestDelete({ type: 'program', id: program.id })
      }),
    [navigate, requestDelete, t, toggleVoucherProgram]
  )
  const { table: voucherTable } = useDataTable({
    data: voucherItems,
    columns: voucherColumns,
    pageCount: Math.ceil((vouchers.data?.totalCount ?? 0) / voucherParams.pageSize) || 1,
    initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }, columnPinning: { right: ['actions'] } },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: { page: 'vouchers_page', perPage: 'vouchers_perPage', sort: 'vouchers_sort' },
    filterPrefix: 'vouchers'
  })
  const { table: usageTable } = useDataTable({
    data: usages.data?.items ?? [],
    columns: usageColumns,
    pageCount: Math.ceil((usages.data?.totalCount ?? 0) / (usagePerPage ?? DEFAULT_PAGE_SIZE)) || 1,
    initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE } },
    getRowId: (row) => row.orderId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: { page: 'voucher_usages_page', perPage: 'voucher_usages_perPage', sort: 'voucher_usages_sort' }
  })
  const { table: programTable } = useDataTable({
    data: programItems,
    columns: programColumns,
    pageCount: Math.ceil((programs.data?.totalCount ?? 0) / programParams.pageSize) || 1,
    initialState: { pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }, columnPinning: { right: ['actions'] } },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'voucher_programs_page',
      perPage: 'voucher_programs_perPage',
      sort: 'voucher_programs_sort'
    },
    filterPrefix: 'voucher_programs'
  })

  const success = (message: string) => {
    toast.success(message)
    setDialog(null)
    setEditingVoucher(null)
    setEditingProgram(null)
    setGenerateProgram(null)
  }
  const exportVouchers = async (params: { visibility?: string; programIds?: string[] } = {}) => {
    if (params.programIds && params.programIds.length > MAX_EXPORT_PROGRAMS) {
      toast.error(t('configsPage.vouchers.exportProgramLimit', { max: MAX_EXPORT_PROGRAMS }))
      return
    }

    try {
      const exportParams = params.programIds?.length
        ? { programIds: params.programIds }
        : { visibility: params.visibility ?? visibility ?? 'all' }
      const file = await (await import('../services')).default.exportVouchers(exportParams)
      downloadExportFile(file)
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: getErrorDescription(isAxiosError<ErrorResponse>(error) ? error.response?.data : undefined)
      })
    }
  }

  return (
    <div className='space-y-5'>
      {view === 'vouchers' ? (
        <DataTable<Voucher> table={voucherTable} isLoading={vouchers.isLoading}>
          <DataTableToolbar<Voucher> table={voucherTable}>
            <Button
              variant='outline'
              size='sm'
              onClick={() => void exportVouchers({ visibility: visibilityFilter === 'all' ? 'all' : visibility })}
            >
              <Download />
              {t('configsPage.vouchers.export')}
            </Button>
            <Button
              size='sm'
              onClick={() => {
                setEditingVoucher(null)
                setDialog('voucher')
              }}
            >
              <Plus />
              {t('configsPage.vouchers.create')}
            </Button>
          </DataTableToolbar>
        </DataTable>
      ) : (
        <DataTable<VoucherProgram> table={programTable} isLoading={programs.isLoading}>
          <DataTableToolbar<VoucherProgram> table={programTable}>
            <Button
              variant='outline'
              size='sm'
              disabled={programTable.getSelectedRowModel().rows.length === 0}
              onClick={() =>
                void exportVouchers({
                  programIds: programTable.getSelectedRowModel().rows.map((row) => row.original.id)
                })
              }
            >
              <Download />
              {t('configsPage.vouchers.export')}
            </Button>
            <Button
              size='sm'
              onClick={() => {
                setEditingProgram(null)
                setDialog('program')
              }}
            >
              <Plus />
              {t('configsPage.vouchers.createProgram')}
            </Button>
          </DataTableToolbar>
        </DataTable>
      )}
      {usageVoucherId && !detailVoucher && (
        <EditorSection
          title={t('configsPage.vouchers.usageHistory')}
          description={t('configsPage.vouchers.usageDescription')}
        >
          <div className='flex justify-end'>
            <Button
              variant='ghost'
              size='icon'
              aria-label={t('common.button.close')}
              onClick={() => setUsageVoucherId(null)}
            >
              <X className='size-4' />
            </Button>
          </div>
          <DataTable<VoucherUsage> table={usageTable} isLoading={usages.isLoading}>
            <DataTableToolbar<VoucherUsage> table={usageTable} />
          </DataTable>
        </EditorSection>
      )}
      <VoucherDetailDialog
        voucher={detailVoucher}
        open={Boolean(detailVoucher)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailVoucher(null)
            setUsageVoucherId(null)
          }
        }}
        usageTable={usageTable}
        isLoadingUsages={usages.isLoading}
        t={t}
      />
      <VoucherFormDialog
        key={`voucher-${editingVoucher?.id ?? 'new'}`}
        open={dialog === 'voucher'}
        voucher={editingVoucher}
        onOpenChange={(open) => !open && setDialog(null)}
        pending={mutations.createVoucher.isPending || mutations.updateVouchers.isPending}
        onSubmit={(payload) => {
          if ('id' in payload)
            mutations.updateVouchers.mutate([payload], { onSuccess: () => success(t('configsPage.vouchers.updated')) })
          else mutations.createVoucher.mutate(payload, { onSuccess: () => success(t('configsPage.vouchers.created')) })
        }}
      />
      <ProgramFormDialog
        key={`program-${editingProgram?.id ?? 'new'}`}
        open={dialog === 'program'}
        program={editingProgram}
        onOpenChange={(open) => !open && setDialog(null)}
        pending={mutations.createProgram.isPending || mutations.updateProgram.isPending}
        onSubmit={(payload) => {
          if ('id' in payload)
            mutations.updateProgram.mutate(payload, { onSuccess: () => success(t('configsPage.vouchers.updated')) })
          else mutations.createProgram.mutate(payload, { onSuccess: () => success(t('configsPage.vouchers.created')) })
        }}
      />
      <GenerateDialog
        key={`generate-${generateProgram?.id ?? 'new'}`}
        open={dialog === 'generate'}
        program={generateProgram}
        onOpenChange={(open) => !open && setDialog(null)}
        pending={mutations.generateVouchers.isPending}
        onSubmit={(payload) =>
          generateProgram &&
          generateVouchers(
            { programId: generateProgram.id, payload },
            { onSuccess: () => success(t('configsPage.vouchers.generated')) }
          )
        }
      />
    </div>
  )
}
