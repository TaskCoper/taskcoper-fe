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
import { useDeleteMilestone } from '../hooks/use-delete-milestone'

interface MilestoneColumnDropdownProps {
  columnId: string
  columnName: string
  children: React.ReactNode
  open: boolean
  setOpen: (open: boolean) => void
}

export default function MilestoneColumnDropdown({
  columnId,
  columnName,
  children,
  open,
  setOpen
}: MilestoneColumnDropdownProps) {
  const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>()
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { deleteMilestone, isDeletingMilestone } = useDeleteMilestone({
    queryKey: ['milestones', projectId, milestoneId]
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
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
