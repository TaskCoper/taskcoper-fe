import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useGetMyProjectPermissions } from '../../roles/hooks/use-get-my-project-permissions'
import { useDeleteMilestone } from '../hooks/use-delete-milestone'

interface MilestoneColumnMenuProps {
  columnId: string
  columnName: string
  children: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
}

export default function MilestoneColumnMenu({
  columnId,
  columnName,
  children,
  open,
  setOpen
}: MilestoneColumnMenuProps) {
  const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canDelete = check('TASKS', 'canDelete')

  const { deleteMilestone, isDeletingMilestone } = useDeleteMilestone({
    queryKey: ['milestones', identifier, milestoneIdentifier],
    parentMilestoneIdentifier: milestoneIdentifier
  })

  const handleDeleteMilestone = async () => {
    const ok = await confirm({
      title: t('milestone.deleteMilestone.milestoneTitle'),
      description: t('milestone.deleteMilestone.description', { milestoneName: columnName }),
      confirmText: t('milestone.deleteMilestone.confirmText'),
      cancelText: t('milestone.deleteMilestone.cancelText'),
      variant: 'destructive'
    })

    if (ok) {
      deleteMilestone({ milestoneId: columnId })
    }
  }

  if (!canDelete) return <div className='size-8' />

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align='start' sideOffset={8}>
        <DropdownMenuLabel>{t('common.ui.action')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='focus:text-destructive'
          onClick={handleDeleteMilestone}
          disabled={isDeletingMilestone}
        >
          <Trash2Icon className='focus:text-destructive' />
          {t('common.button.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
