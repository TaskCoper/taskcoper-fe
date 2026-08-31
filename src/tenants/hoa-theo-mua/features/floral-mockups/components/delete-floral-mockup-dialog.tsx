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
import { CircleAlertIcon } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useDeleteFloralMockup } from '../hooks/use-delete-floral-mockup'
import type { FloralMockupListItem } from '../types'

const DeleteFloralMockupDialog = ({
  mockup,
  open,
  onOpenChange,
  onDeleted
}: {
  mockup: FloralMockupListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) => {
  const { t } = useTenantTranslation()
  const { deleteFloralMockup, isDeletingFloralMockup, isDeleteFloralMockupError, resetDeleteFloralMockup } =
    useDeleteFloralMockup()

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeletingFloralMockup) return
    if (!nextOpen) resetDeleteFloralMockup()
    onOpenChange(nextOpen)
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!mockup) return

    resetDeleteFloralMockup()
    deleteFloralMockup(
      { id: mockup.id },
      {
        onSuccess: () => {
          onDeleted?.()
          onOpenChange(false)
        }
      }
    )
  }

  if (!mockup) return null

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('floralMockups.deleteAction.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('floralMockups.deleteAction.description', { name: mockup.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isDeleteFloralMockupError && (
          <div
            role='alert'
            className='flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'
          >
            <CircleAlertIcon className='mt-0.5 size-4 shrink-0' />
            <span>{t('floralMockups.deleteAction.failed')}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingFloralMockup}>{t('common.button.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20'
            disabled={isDeletingFloralMockup}
            onClick={handleDelete}
          >
            {isDeletingFloralMockup && <Spinner />}
            {t(`floralMockups.deleteAction.${isDeleteFloralMockupError ? 'retry' : 'confirm'}`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteFloralMockupDialog
