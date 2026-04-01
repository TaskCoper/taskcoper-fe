import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import AddVoucherTargetsDialog from '@/features/vouchers/components/add-voucher-targets-dialog'
import UpdateVoucherForm from '@/features/vouchers/components/update-voucher-form'
import { useDeleteVoucher } from '@/features/vouchers/hooks/use-delete-voucher'
import { useDeleteVoucherTarget } from '@/features/vouchers/hooks/use-delete-voucher-target'
import { useGetVoucher } from '@/features/vouchers/hooks/use-get-voucher'
import { useUpdateVoucher } from '@/features/vouchers/hooks/use-update-voucher'
import type { UpdateVoucherFormValues } from '@/features/vouchers/validations'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { TargetTypeLabel, type VoucherTargetRow } from '@/types/voucher.type'
import { PackageIcon, PlusIcon, TicketIcon, Trash2Icon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

const VoucherSkeleton = () => (
  <div className='max-w-4xl mx-auto p-6 space-y-12 pb-20'>
    <div className='space-y-4'>
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-6 rounded-full' />
          <Skeleton className='h-7 w-32' />
        </div>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>

      <div className='space-y-4 pt-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-24 w-full' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>
    </div>

    <div className='space-y-6'>
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-6 rounded-full' />
          <Skeleton className='h-7 w-48' />
        </div>
        <Skeleton className='h-4 w-full' />
      </div>

      <div className='space-y-2'>
        <div className='flex justify-end'>
          <Skeleton className='h-8 w-28' />
        </div>
        <div className='border rounded-lg overflow-hidden'>
          <div className='divide-y'>
            {[1, 2].map((i) => (
              <div key={i} className='p-4 flex items-center justify-between gap-4'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-6 w-24 rounded-md' />
                <Skeleton className='h-8 w-8' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function MentorVoucherPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { voucherId } = useParams<{ voucherId: string }>()
  const { confirm } = useConfirmStore()
  const { methods, updateVoucher, isUpdatingVoucher } = useUpdateVoucher()
  const { deleteVoucher, isDeletingVoucher } = useDeleteVoucher()

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

  const handleDelete = async () => {
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
  }

  const onSubmit: SubmitHandler<UpdateVoucherFormValues> = (values) => {
    updateVoucher({ body: values })
  }

  if (isLoadingVoucher) {
    return (
      <div className='absolute inset-0 overflow-auto'>
        <VoucherSkeleton />
      </div>
    )
  }

  return (
    <div className='absolute inset-0 overflow-auto'>
      <div className='max-w-4xl mx-auto p-6 space-y-12 pb-20'>
        <div className='space-y-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <TicketIcon className='size-6 text-primary' />
              <p className='text-xl font-bold'>{t('voucher.page.infoTitle')}</p>
            </div>
            <p className='text-sm text-muted-foreground'>{t('voucher.page.infoDescription')}</p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4 pt-4'>
              <UpdateVoucherForm />

              <div className='flex justify-end items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='w-full sm:w-auto text-destructive border-destructive/40 hover:text-destructive'
                  onClick={handleDelete}
                  disabled={isDeletingVoucher || isUpdatingVoucher}
                >
                  {isDeletingVoucher ? <Spinner /> : null}
                  {t('common.button.delete')}
                </Button>

                <Button
                  type='submit'
                  size='sm'
                  className='w-full sm:w-auto'
                  disabled={!methods.formState.isDirty || isUpdatingVoucher}
                >
                  {isUpdatingVoucher ? <Spinner /> : null}
                  {t('common.button.save')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>

        <div className='space-y-6'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <PackageIcon className='size-6 text-primary' />
              <p className='text-xl font-bold'>{t('voucher.page.targetsTitle')}</p>
            </div>
            <p className='text-sm text-muted-foreground'>{t('voucher.page.targetsDescription')}</p>
          </div>

          <div className='flex flex-col gap-2'>
            {voucher?.id ? (
              <div className='ml-auto'>
                <AddVoucherTargetsDialog voucherId={voucher.id}>
                  <Button size='sm'>
                    <PlusIcon />
                    {t('voucher.target.item.create')}
                  </Button>
                </AddVoucherTargetsDialog>
              </div>
            ) : null}

            <div className='border rounded-lg bg-card overflow-hidden'>
              <Table>
                <TableBody>
                  {voucher?.targets?.map((target) => (
                    <VoucherTargetRow key={target.id} target={target} voucherId={voucher.id} />
                  ))}
                  {(!voucher?.targets || voucher.targets.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className='h-32 text-center'>
                        <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                          <PackageIcon className='size-8 opacity-20' />
                          <p>{t('common.ui.noDataAvailable')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const VoucherTargetRow = ({ target, voucherId }: { target: VoucherTargetRow; voucherId: string }) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { deleteVoucherTarget, isDeletingVoucherTarget } = useDeleteVoucherTarget()

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('voucher.target.delete.title'),
      description: t('voucher.target.delete.description', {
        targetName: target.targetName
      }),
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    deleteVoucherTarget({ voucherId, targetId: target.targetId })
  }

  return (
    <TableRow className='group transition-colors'>
      <TableCell className='font-medium p-4'>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-semibold'>{target.targetName}</p>
        </div>
      </TableCell>

      <TableCell className='p-4 text-center'>
        <Badge variant='secondary' className='rounded-md'>
          {t(TargetTypeLabel[target.targetType])}
        </Badge>
      </TableCell>

      <TableCell className='text-right p-4'>
        <Button
          size='icon-sm'
          variant='ghost'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          onClick={handleDelete}
          disabled={isDeletingVoucherTarget}
        >
          {isDeletingVoucherTarget ? <Spinner /> : <Trash2Icon className='size-4' />}
        </Button>
      </TableCell>
    </TableRow>
  )
}
