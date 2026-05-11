import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import AddVoucherTargetsDialog from '@/features/vouchers/components/add-voucher-targets-dialog'
import { useDeleteVoucherTarget } from '@/features/vouchers/hooks/use-delete-voucher-target'
import { useUpdateVoucherTargetStatus } from '@/features/vouchers/hooks/use-update-voucher-target-status'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { type VoucherRow, type VoucherTargetRow } from '@/features/vouchers/types'
import { PackageIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TargetsTabProps {
  voucher: VoucherRow | null | undefined
}

export default function TargetsTab({ voucher }: TargetsTabProps) {
  const { t } = useTranslation()

  return (
    <div className='grow space-y-6'>
      <div>
        <p className='text-xl font-bold'>{t('voucher.page.targetsTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('voucher.page.targetsDescription')}</p>
      </div>

      <div className='flex flex-col gap-4'>
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

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {voucher?.targets?.map((target) => (
            <VoucherTargetCard key={target.id} target={target} voucherId={voucher.id} />
          ))}
        </div>

        {(!voucher?.targets || voucher.targets.length === 0) && (
          <div className='h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5'>
            <PackageIcon className='size-8 opacity-20' />
            <p>{t('common.ui.noDataAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const VoucherTargetCard = ({ target, voucherId }: { target: VoucherTargetRow; voucherId: string }) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { deleteVoucherTarget, isDeletingVoucherTarget } = useDeleteVoucherTarget()
  const { updateVoucherTargetStatus, isUpdatingVoucherTargetStatus } = useUpdateVoucherTargetStatus({ voucherId })

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
    <div className='space-y-2'>
      {target.coverImageUrl ? (
        <img src={target.coverImageUrl} alt={target.targetName} className='h-40 w-full object-cover' />
      ) : (
        <div className='h-40 bg-muted' />
      )}

      <div>
        <div className='flex items-center gap-6'>
          <p className='font-semibold truncate'>{target.targetName}</p>
          <div className='flex items-center gap-2'>
            <Switch
              checked={target.isActive}
              onCheckedChange={(checked) =>
                updateVoucherTargetStatus({ body: { targetId: target.targetId, isActive: checked } })
              }
              disabled={isUpdatingVoucherTargetStatus}
            />
            <Button size='icon-sm' variant='ghost' onClick={handleDelete} disabled={isDeletingVoucherTarget}>
              {isDeletingVoucherTarget ? <Spinner /> : <Trash2Icon className='size-4' />}
            </Button>
          </div>
        </div>
        <p className='text-sm text-muted-foreground'>{target.targetDescription}</p>
      </div>
    </div>
  )
}
