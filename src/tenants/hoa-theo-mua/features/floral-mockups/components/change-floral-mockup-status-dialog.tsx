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
import { useChangeFloralMockupStatus } from '../hooks/use-change-floral-mockup-status'
import type { FloralMockupListItem } from '../types'

const ChangeFloralMockupStatusDialog = ({
  mockup,
  open,
  onOpenChange
}: {
  mockup: FloralMockupListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { t } = useTenantTranslation()
  const { changeFloralMockupStatus, isChangingFloralMockupStatus } = useChangeFloralMockupStatus()
  const targetStatus = mockup ? !mockup.isActive : false
  const action = targetStatus ? 'activate' : 'deactivate'

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!mockup) return

    changeFloralMockupStatus({ id: mockup.id, isActive: targetStatus }, { onSuccess: () => onOpenChange(false) })
  }

  if (!mockup) return null

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isChangingFloralMockupStatus) onOpenChange(nextOpen)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`floralMockups.statusAction.${action}Title`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`floralMockups.statusAction.${action}Description`, { name: mockup.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isChangingFloralMockupStatus}>{t('common.button.cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={isChangingFloralMockupStatus} onClick={handleConfirm}>
            {isChangingFloralMockupStatus && <Spinner />}
            {t(`floralMockups.statusAction.${action}Confirm`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ChangeFloralMockupStatusDialog
