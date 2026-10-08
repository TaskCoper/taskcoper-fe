import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataTable } from '@/hooks/use-data-table'
import StatCard from '@/features/projects/core/components/stat-card'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import {
  CalendarDays,
  ChevronRightIcon,
  CircleDot,
  Clock3,
  Code2,
  Download,
  Plus,
  TicketPercent,
  Users
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { getVoucherProgramCodeColumns } from '../features/vouchers/components/voucher-program-code-columns'
import { GenerateDialog } from '../features/vouchers/components/vouchers-editor'
import { displayDateTime, formatMoney } from '../features/vouchers/components/voucher-date-utils'
import {
  useGenerateVouchers,
  useGetVoucherProgram,
  useGetVouchers,
  useSetVouchersActive
} from '../features/vouchers/hooks'
import voucherService from '../features/vouchers/services'

type ProgramTab = 'overview' | 'codes'

export default function VoucherProgramDetailPage() {
  const { t } = useTenantTranslation()
  const { programId } = useParams<{ programId: string }>()
  const [rawTab, setTab] = useQueryState('tab', parseAsString)
  const [keyword] = useQueryState('voucher_program_codes', parseAsString)
  const [page] = useQueryState('voucher_program_codes_page', parseAsInteger)
  const [perPage] = useQueryState('voucher_program_codes_perPage', parseAsInteger)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const currentTab: ProgramTab = rawTab === 'codes' ? 'codes' : 'overview'
  const { program: programQuery, isGettingProgram } = useGetVoucherProgram(programId)
  const program = programQuery.data
  const { vouchers } = useGetVouchers({
    programId,
    pageIndex: page ?? 1,
    pageSize: perPage ?? 20,
    keyword: keyword || undefined
  })
  const { setVouchersActive } = useSetVouchersActive()
  const { generateVouchers, isGeneratingVouchers } = useGenerateVouchers()

  const codeColumns = useMemo(
    () => getVoucherProgramCodeColumns(t, (voucher, isActive) => setVouchersActive({ ids: [voucher.id], isActive })),
    [setVouchersActive, t]
  )
  const { table: codeTable } = useDataTable({
    data: vouchers.data?.items ?? [],
    columns: codeColumns,
    pageCount: Math.ceil((vouchers.data?.totalCount ?? 0) / (perPage ?? 20)) || 1,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 },
      columnVisibility: {
        description: false,
        discountType: false,
        updatedAt: false
      }
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'voucher_program_codes_page',
      perPage: 'voucher_program_codes_perPage',
      sort: 'voucher_program_codes_sort'
    },
    filterPrefix: 'voucher_program_codes'
  })

  if (isGettingProgram) return <div className='p-6 text-sm text-muted-foreground'>{t('common.loading')}</div>
  if (!program)
    return <div className='p-6 text-sm text-muted-foreground'>{t('configsPage.vouchers.programNotFound')}</div>

  const changeTab = (value: string) => setTab(value === 'codes' ? 'codes' : null)
  const exportProgramVouchers = async () => {
    if (!program) return

    try {
      const blob = await voucherService.exportVouchers({ programIds: [program.id] })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${program.name}-vouchers.xlsx`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error(t('error.somethingWentWrong'))
    }
  }

  return (
    <div className='absolute inset-0 overflow-y-auto bg-muted/30'>
      <Tabs value={currentTab} onValueChange={changeTab} className='flex flex-col'>
        <div className='space-y-5 px-4 pb-0 pt-6 sm:px-6 lg:px-8'>
          <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <Link
              to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers?tab=program`}
              className='transition-colors hover:text-foreground'
            >
              {t('configsPage.vouchers.title')}
            </Link>
            <ChevronRightIcon className='size-3.5 shrink-0' />
            <span className='font-medium text-foreground'>{program.name}</span>
          </nav>

          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex min-w-0 items-start gap-3'>
              <span className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <TicketPercent className='size-5' />
              </span>
              <div className='min-w-0 space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h1 className='text-2xl font-bold leading-tight tracking-tight'>{program.name}</h1>
                  <Badge variant={program.isActive ? 'default' : 'secondary'}>
                    <CircleDot className='mr-1 size-3' />
                    {program.isActive
                      ? t('configsPage.vouchers.programActive')
                      : t('configsPage.vouchers.programInactive')}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground'>{t('configsPage.vouchers.programDetailDescription')}</p>
                <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                  <CalendarDays className='size-3.5' />
                  {displayDateTime(program.startAt)} - {displayDateTime(program.endAt)}
                </div>
              </div>
            </div>
            <Button variant='outline' size='sm' asChild>
              <Link to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers?tab=program`}>
                {t('configsPage.vouchers.backToPrograms')}
              </Link>
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title={t('configsPage.vouchers.voucherCount')}
              value={program.voucherCount}
              icon={<Code2 className='size-4 text-white' />}
              color='blue'
            />
            <StatCard
              title={t('configsPage.vouchers.usedVoucherCount')}
              value={program.usedVoucherCount}
              icon={<Users className='size-4 text-white' />}
              color='green'
            />
            <StatCard
              title={t('configsPage.vouchers.minOrderAmount')}
              value={
                program.minOrderAmount == null
                  ? t('configsPage.vouchers.unlimited')
                  : formatMoney(program.minOrderAmount, t('configsPage.vouchers.currency'))
              }
              icon={<TicketPercent className='size-4 text-white' />}
              color='purple'
            />
            <StatCard
              title={t('configsPage.vouchers.validityPeriod')}
              value={displayDateTime(program.endAt)}
              icon={<Clock3 className='size-4 text-white' />}
              color='slate'
            />
          </div>

          <TabsList className='w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 flex-nowrap [&::-webkit-scrollbar]:hidden'>
            <TabsTrigger
              value='overview'
              className='relative flex-none shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none'
            >
              {t('configsPage.vouchers.programOverview')}
            </TabsTrigger>
            <TabsTrigger
              value='codes'
              className='relative flex-none shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none'
            >
              {t('configsPage.vouchers.programCodes')}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='w-full px-4 pb-8 pt-5 sm:px-6 lg:px-8'>
          <TabsContent value='overview' className='mt-0'>
            <div className='space-y-8'>
              <section className='space-y-3'>
                <div>
                  <h2 className='text-lg font-bold'>{t('configsPage.vouchers.programBasicInfo')}</h2>
                  <p className='text-sm text-muted-foreground'>
                    {t('configsPage.vouchers.programBasicInfoDescription')}
                  </p>
                </div>
                <div className='divide-y overflow-hidden rounded-lg border bg-card'>
                  <div className='grid gap-1 px-4 py-3 text-sm sm:grid-cols-[16rem_1fr] sm:gap-4'>
                    <span className='text-muted-foreground'>{t('configsPage.vouchers.programName')}</span>
                    <span className='font-medium'>{program.name}</span>
                  </div>
                  <div className='grid gap-1 px-4 py-3 text-sm sm:grid-cols-[16rem_1fr] sm:gap-4'>
                    <span className='text-muted-foreground'>{t('configsPage.vouchers.programStatus')}</span>
                    <span className='font-medium'>
                      <Badge variant={program.isActive ? 'default' : 'secondary'}>
                        {program.isActive
                          ? t('configsPage.vouchers.programActive')
                          : t('configsPage.vouchers.programInactive')}
                      </Badge>
                    </span>
                  </div>
                  <div className='grid gap-1 px-4 py-3 text-sm sm:grid-cols-[16rem_1fr] sm:gap-4'>
                    <span className='text-muted-foreground'>{t('configsPage.vouchers.validityPeriod')}</span>
                    <span className='font-medium'>
                      {displayDateTime(program.startAt)} - {displayDateTime(program.endAt)}
                    </span>
                  </div>
                </div>
              </section>

              <section className='space-y-3'>
                <div>
                  <h2 className='text-lg font-bold'>{t('configsPage.vouchers.programPolicy')}</h2>
                  <p className='text-sm text-muted-foreground'>{t('configsPage.vouchers.programPolicyDescription')}</p>
                </div>
                <div className='divide-y overflow-hidden rounded-lg border bg-card'>
                  <div className='grid gap-1 px-4 py-3 text-sm sm:grid-cols-[16rem_1fr] sm:gap-4'>
                    <span className='text-muted-foreground'>{t('configsPage.vouchers.minOrderAmount')}</span>
                    <span className='font-medium'>
                      {program.minOrderAmount == null
                        ? t('configsPage.vouchers.unlimited')
                        : formatMoney(program.minOrderAmount, t('configsPage.vouchers.currency'))}
                    </span>
                  </div>
                  <div className='grid gap-1 px-4 py-3 text-sm sm:grid-cols-[16rem_1fr] sm:gap-4'>
                    <span className='text-muted-foreground'>{t('configsPage.vouchers.maxOrderAmount')}</span>
                    <span className='font-medium'>
                      {program.maxOrderAmount == null
                        ? t('configsPage.vouchers.unlimited')
                        : formatMoney(program.maxOrderAmount, t('configsPage.vouchers.currency'))}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>
          <TabsContent value='codes' className='mt-0'>
            <DataTable table={codeTable} isLoading={vouchers.isLoading}>
              <DataTableToolbar table={codeTable}>
                <Button variant='outline' onClick={() => void exportProgramVouchers()}>
                  <Download className='size-4' />
                  {t('configsPage.vouchers.export')}
                </Button>
                <Button onClick={() => setIsGenerateOpen(true)}>
                  <Plus className='size-4' />
                  {t('configsPage.vouchers.generate')}
                </Button>
              </DataTableToolbar>
            </DataTable>
          </TabsContent>
        </div>
      </Tabs>
      <GenerateDialog
        open={isGenerateOpen}
        program={program}
        pending={isGeneratingVouchers}
        onOpenChange={setIsGenerateOpen}
        onSubmit={(payload) => {
          generateVouchers(
            { programId: program.id, payload },
            {
              onSuccess: () => {
                toast.success(t('configsPage.vouchers.generated'))
                setIsGenerateOpen(false)
                void setTab('codes')
              }
            }
          )
        }}
      />
    </div>
  )
}
