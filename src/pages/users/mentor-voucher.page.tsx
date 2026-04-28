import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatCard from '@/features/projects/components/stat-card'
import InfoTab from '@/features/vouchers/components/tabs/info-tab'
import RedemptionsTab from '@/features/vouchers/components/tabs/redemptions-tab'
import TargetsTab from '@/features/vouchers/components/tabs/targets-tab'
import { useDeleteVoucher } from '@/features/vouchers/hooks/use-delete-voucher'
import { useGetVoucher } from '@/features/vouchers/hooks/use-get-voucher'
import { useUpdateVoucher } from '@/features/vouchers/hooks/use-update-voucher'
import type { UpdateVoucherFormValues } from '@/features/vouchers/validations'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { formatCurrency } from '@/shared/utils'
import { DiscountType, DiscountTypeLabel } from '@/types/voucher.type'
import { HashIcon, TagIcon, TicketPercentIcon, UsersRoundIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'

const VoucherSkeleton = () => (
  <div className='absolute inset-0 flex flex-col overflow-hidden'>
    <div className='bg-muted/50 px-6 pt-6 space-y-4'>
      <div className='flex items-center gap-2'>
        <div className='-space-y-0.5'>
          <div className='flex items-center gap-2'>
            <Skeleton className='size-6 rounded-full' />
            <Skeleton className='h-8 w-48' />
          </div>
          <Skeleton className='h-4 w-64' />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-[82px] w-full rounded-xl' />
        ))}
      </div>

      <div className='flex gap-2 border-b'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-10 w-40' />
        ))}
      </div>
    </div>

    <div className='px-6 pt-6 space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='space-y-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function MentorVoucherPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const { voucherId } = useParams<{ voucherId: string }>()
  const { confirm } = useConfirmStore()
  const { methods, updateVoucher, isUpdatingVoucher } = useUpdateVoucher()
  const { deleteVoucher, isDeletingVoucher } = useDeleteVoucher()

  const currentTab = searchParams.get('tab') || 'info'

  const { voucher, isLoadingVoucher } = useGetVoucher({ voucherId })

  useEffect(() => {
    if (voucher) {
      methods.reset({
        voucherId: voucher.id,
        name: voucher.name,
        description: voucher.description,
        startsAtUtc: voucher.startsAtUtc,
        endsAtUtc: voucher.endsAtUtc,
        isActive: voucher.isActive,
        totalUsageLimit: voucher.totalUsageLimit,
        usageLimitPerUser: voucher.usageLimitPerUser,
        isStackable: voucher.isStackable
      })
    }
  }, [voucher, methods])

  const handleDelete = useCallback(async () => {
    if (!voucher) return

    const ok = await confirm({
      title: t('voucher.delete.title'),
      description: t('voucher.delete.description', {
        voucherCode: voucher.code
      }),
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    deleteVoucher(
      { voucherId: voucher.id },
      {
        onSuccess: () => navigate('/vouchers')
      }
    )
  }, [confirm, voucher, deleteVoucher, navigate, t])

  const onSubmit: SubmitHandler<UpdateVoucherFormValues> = useCallback(
    (values) => {
      updateVoucher({ body: values })
    },
    [updateVoucher]
  )

  const TABS = useMemo(
    () => [
      {
        value: 'info',
        label: t('voucher.page.infoTitle'),
        content: (
          <InfoTab
            methods={methods}
            onSubmit={onSubmit}
            onDelete={handleDelete}
            isDeleting={isDeletingVoucher}
            isUpdating={isUpdatingVoucher}
          />
        )
      },
      {
        value: 'targets',
        label: t('voucher.page.targetsTitle'),
        content: <TargetsTab voucher={voucher} />
      },
      {
        value: 'redemptions',
        label: t('voucher.page.redemptionsTitle'),
        content: voucherId ? <RedemptionsTab voucherId={voucherId} /> : null
      }
    ],
    [methods, onSubmit, handleDelete, isDeletingVoucher, isUpdatingVoucher, voucher, voucherId, t]
  )

  if (isLoadingVoucher) {
    return (
      <div className='absolute inset-0 overflow-auto'>
        <VoucherSkeleton />
      </div>
    )
  }

  return (
    <div className='absolute inset-0 flex flex-col overflow-hidden'>
      <Tabs
        value={currentTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
        className='flex flex-1 flex-col min-h-0'
      >
        <div className='bg-muted/50 px-6 pt-6 space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='-space-y-0.5'>
              <div className='flex items-center gap-2'>
                <TicketPercentIcon className='size-6 text-primary' />
                <p className='text-2xl font-bold'>{voucher?.name}</p>
              </div>
              <p className='text-sm text-muted-foreground'>{voucher?.description}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <StatCard
              title={t('voucher.field.code')}
              value={voucher?.code ?? '-'}
              icon={<HashIcon className='size-4 text-white' />}
              color='slate'
            />
            <StatCard
              title={t('voucher.field.discountType')}
              value={voucher ? t(DiscountTypeLabel[voucher.discountType]) : '-'}
              icon={<TagIcon className='size-4 text-white' />}
              color='purple'
            />
            <StatCard
              title={t('voucher.field.discountValue')}
              value={
                voucher
                  ? voucher.discountType === DiscountType.Percentage
                    ? `${voucher.discountValue}%`
                    : formatCurrency(voucher.discountValue)
                  : '-'
              }
              icon={<TicketPercentIcon className='size-4 text-white' />}
              color='blue'
            />
            <StatCard
              title={t('voucher.column.usage')}
              value={`${voucher?.usedCount ?? 0}/${voucher?.totalUsageLimit ?? 0}`}
              icon={<UsersRoundIcon className='size-4 text-white' />}
              color='green'
            />
          </div>

          <TabsList className='w-full justify-start rounded-none border-b p-0 bg-transparent gap-2 overflow-x-auto flex-nowrap [&::-webkit-scrollbar]:hidden'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                className='w-40 flex-none shrink-0 relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold'
                value={tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} className='px-6 pt-3 pb-20' value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
