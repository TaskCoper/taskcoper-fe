import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import AddMentorPackageRuleDialog from '@/features/mentor-package-rules/components/add-mentor-package-rule-dialog'
import { useDeleteMentorPackageRule } from '@/features/mentor-package-rules/hooks/use-delete-mentor-package-rule'
import { useUpdateMentorPackageRule } from '@/features/mentor-package-rules/hooks/use-update-mentor-package-rule'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { CheckIcon, ClockIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MentorPackageRule } from '../../types'

interface PackageRulesTabProps {
  mentorPackageId: string | undefined
  rules: MentorPackageRule[] | undefined
}

export default function PackageRulesTab({ mentorPackageId, rules }: PackageRulesTabProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      <div>
        <p className='text-xl font-bold'>{t('mentorPackage.page.durationTitle')}</p>
        <p className='text-sm text-muted-foreground'>{t('mentorPackage.page.durationDescription')}</p>
      </div>

      <div className='flex flex-col gap-2'>
        {mentorPackageId ? (
          <div className='ml-auto'>
            <AddMentorPackageRuleDialog mentorPackageId={mentorPackageId}>
              <Button size='sm'>
                <PlusIcon />
                {t('mentorPackageRule.item.create')}
              </Button>
            </AddMentorPackageRuleDialog>
          </div>
        ) : null}

        <div className='border rounded-lg bg-card overflow-hidden'>
          <Table>
            <TableBody>
              {rules?.map((rule) => (
                <MentorPackageRuleRow key={rule.id} rule={rule} mentorPackageId={mentorPackageId!} />
              ))}
              {(!rules || rules.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className='h-32 text-center'>
                    <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                      <ClockIcon className='size-8 opacity-20' />
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
  )
}

const MentorPackageRuleRow = ({ rule, mentorPackageId }: { rule: MentorPackageRule; mentorPackageId: string }) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const [isEditing, setIsEditing] = useState(false)
  const { updateMentorPackageRule, isUpdatingMentorPackageRule } = useUpdateMentorPackageRule({ mentorPackageId })
  const { deleteMentorPackageRule, isDeletingMentorPackageRule } = useDeleteMentorPackageRule({ mentorPackageId })
  const [values, setValues] = useState({ no: rule.no.toString(), totalTimeSlots: rule.totalTimeSlots.toString() })

  const handleSave = () => {
    updateMentorPackageRule(
      {
        body: {
          id: rule.id,
          no: Number(values.no),
          totalTimeSlots: Number(values.totalTimeSlots)
        }
      },
      {
        onSuccess: () => setIsEditing(false)
      }
    )
  }

  const handleCancel = () => {
    setValues({ no: rule.no.toString(), totalTimeSlots: rule.totalTimeSlots.toString() })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('mentorPackageRule.delete.title'),
      description: t('mentorPackageRule.delete.description', {
        no: rule.no
      }),
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    deleteMentorPackageRule({ ruleId: rule.id })
  }

  return (
    <TableRow className='group transition-colors'>
      <TableCell className='font-medium p-4'>
        {isEditing ? (
          <div className='flex items-center gap-2'>
            <p className='text-xs font-semibold text-muted-foreground'>{t('mentorPackageRule.item.session')}</p>
            <Input
              type='number'
              value={values.no}
              onChange={(e) => setValues((prev) => ({ ...prev, no: e.target.value }))}
              className='h-8 w-16'
              autoFocus
            />
          </div>
        ) : (
          <Badge className='rounded-md'>
            {t('mentorPackageRule.item.session')} {rule.no}
          </Badge>
        )}
      </TableCell>

      <TableCell className='p-4'>
        {isEditing ? (
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              value={values.totalTimeSlots}
              onChange={(e) => setValues((prev) => ({ ...prev, totalTimeSlots: e.target.value }))}
              className='h-8 w-20'
            />
            <p className='text-sm text-muted-foreground'>{t('mentorPackageRule.item.hours')}</p>
          </div>
        ) : (
          <div className='flex items-center gap-1'>
            <p className='text-sm font-semibold'>{rule.totalTimeSlots}</p>
            <p className='text-sm text-muted-foreground'>{t('mentorPackageRule.item.hours')}</p>
          </div>
        )}
      </TableCell>

      <TableCell className='text-right p-4'>
        {isEditing ? (
          <div className='flex items-center justify-end gap-1'>
            <Button size='icon-sm' variant='ghost' onClick={handleSave} disabled={isUpdatingMentorPackageRule}>
              {isUpdatingMentorPackageRule ? <Spinner className='size-4' /> : <CheckIcon className='size-4' />}
            </Button>

            <Button size='icon-sm' variant='ghost' onClick={handleCancel} disabled={isUpdatingMentorPackageRule}>
              <XIcon className='size-4' />
            </Button>
          </div>
        ) : (
          <div className='flex items-center justify-end gap-2'>
            <Button variant='secondary' size='sm' onClick={() => setIsEditing(true)}>
              {t('mentorPackageRule.item.edit')}
            </Button>
            <Button
              size='icon-sm'
              variant='ghost'
              className='text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={handleDelete}
              disabled={isDeletingMentorPackageRule}
            >
              {isDeletingMentorPackageRule ? <Spinner className='size-4' /> : <Trash2Icon className='size-4' />}
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
