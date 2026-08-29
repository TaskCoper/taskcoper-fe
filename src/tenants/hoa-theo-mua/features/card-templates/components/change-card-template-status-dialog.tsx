import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { MouseEvent } from 'react'
import { useChangeCardTemplateStatus } from '../hooks/use-change-card-template-status'
import type { CardTemplateListItem } from '../types'

const ChangeCardTemplateStatusDialog = ({
  template,
  open,
  onOpenChange
}: {
  template: CardTemplateListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { t } = useTenantTranslation()
  const { changeCardTemplateStatus, isChangingCardTemplateStatus } = useChangeCardTemplateStatus()
  const targetStatus = template ? !template.isActive : false
  const action = targetStatus ? 'activate' : 'deactivate'

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!template) return

    changeCardTemplateStatus(
      { id: template.id, isActive: targetStatus },
      {
        onSuccess: () => onOpenChange(false)
      }
    )
  }

  if (!template) return null

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isChangingCardTemplateStatus) onOpenChange(nextOpen)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`cardTemplates.statusAction.${action}Title`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`cardTemplates.statusAction.${action}Description`, { name: template.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isChangingCardTemplateStatus}>{t('common.button.cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={isChangingCardTemplateStatus} onClick={handleConfirm}>
            {isChangingCardTemplateStatus && <Spinner />}
            {t(`cardTemplates.statusAction.${action}Confirm`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ChangeCardTemplateStatusDialog
