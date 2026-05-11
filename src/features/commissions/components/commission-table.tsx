import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CommissionTargetModelLabel, type Commission, type CommissionRow } from '@/features/commissions/types'
import { formatCurrency, formatDate } from '@/shared/utils'
import type { Row } from '@tanstack/react-table'
import { CheckCircle2Icon, CheckIcon, CircleXIcon, EditIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUpdateCommission } from '../hooks/use-update-commission'

interface CommissionTableProps {
  row: Row<CommissionRow>
  onDeleteCommission: (commissionId: string) => void
}

function CommissionTableRowItem({
  item,
  onDeleteCommission
}: {
  item: Commission
  onDeleteCommission: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const { methods, updateCommission, isUpdatingCommission } = useUpdateCommission()
  const { control, register, handleSubmit, reset } = methods

  const onEdit = () => {
    reset({
      commissionId: item.commissionId,
      targetModel: item.targetModel,
      titleLevel: item.titleLevel,
      rate: Number((item.rate * 100).toFixed(0)),
      minAmount: item.minAmount,
      maxAmount: item.maxAmount,
      isActive: item.isActive
    })
    setIsEditing(true)
  }

  const onCancel = () => {
    setIsEditing(false)
    reset()
  }

  const onSubmit = handleSubmit((data) => {
    updateCommission(
      { body: data },
      {
        onSuccess: () => {
          setIsEditing(false)
        }
      }
    )
  })

  return (
    <TableRow>
      {isEditing ? (
        <>
          <TableCell className='py-2 font-medium'>{CommissionTargetModelLabel[item.targetModel]}</TableCell>
          <TableCell className='py-2'>
            <div className='flex items-center gap-1'>
              <Input type='number' {...register('rate')} className='h-8 w-20' />
              <span>%</span>
            </div>
          </TableCell>
          <TableCell className='py-2'>
            <Input type='number' {...register('minAmount')} className='h-8 w-32' />
          </TableCell>
          <TableCell className='py-2'>
            <Input type='number' {...register('maxAmount')} className='h-8 w-32' />
          </TableCell>
          <TableCell className='pt-4 flex justify-center'>
            <Controller
              name='isActive'
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </TableCell>
          <TableCell className='py-2 text-muted-foreground'>{formatDate(item.createdOnUtc)}</TableCell>
          <TableCell className='py-2'>
            <Button variant='ghost' size='icon-sm' onClick={onSubmit} disabled={isUpdatingCommission}>
              <CheckIcon className='size-4 text-green-600' />
            </Button>
            <Button variant='ghost' size='icon-sm' onClick={onCancel} disabled={isUpdatingCommission}>
              <XIcon className='size-4 text-destructive' />
            </Button>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell className='py-2 font-medium'>{CommissionTargetModelLabel[item.targetModel]}</TableCell>
          <TableCell className='py-2 text-primary font-semibold'>{(item.rate * 100).toFixed(0)}%</TableCell>
          <TableCell className='py-2'>{formatCurrency(item.minAmount)}</TableCell>
          <TableCell className='py-2'>{formatCurrency(item.maxAmount)}</TableCell>
          <TableCell className='py-2'>
            <div className='flex items-center justify-center'>
              {item.isActive ? (
                <CheckCircle2Icon className='size-4 text-green-600' />
              ) : (
                <CircleXIcon className='size-4 text-destructive' />
              )}
            </div>
          </TableCell>
          <TableCell className='py-2 text-muted-foreground'>{formatDate(item.createdOnUtc)}</TableCell>
          <TableCell className='py-2'>
            <Button variant='ghost' size='icon-sm' onClick={onEdit}>
              <EditIcon className='size-3.5' />
            </Button>
            <Button variant='ghost' size='icon-sm' onClick={() => onDeleteCommission(item.commissionId)}>
              <Trash2Icon className='size-3.5 text-destructive' />
            </Button>
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

export default function CommissionTable({ row, onDeleteCommission }: CommissionTableProps) {
  const { t } = useTranslation()

  return (
    <div className='p-2'>
      <div className='rounded-md border bg-background'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='h-9'>{t('commission.field.targetModel')}</TableHead>
              <TableHead className='h-9'>{t('commission.field.rate')}</TableHead>
              <TableHead className='h-9'>{t('commission.field.minAmount')}</TableHead>
              <TableHead className='h-9'>{t('commission.field.maxAmount')}</TableHead>
              <TableHead className='h-9 flex justify-center py-2'>{t('common.field.isActive')}</TableHead>
              <TableHead className='h-9'>{t('common.field.date')}</TableHead>
              <TableHead className='h-9 w-20'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {row.original.commissions.map((item) => (
              <CommissionTableRowItem key={item.commissionId} item={item} onDeleteCommission={onDeleteCommission} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
