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
import { useDeleteCardTemplate } from '../hooks/use-delete-card-template'
import type { CardTemplateListItem } from '../types'

const DeleteCardTemplateDialog = ({
  template,
  open,
  onOpenChange,
  onDeleted
}: {
  template: CardTemplateListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) => {
  const { t } = useTenantTranslation()
  const { deleteCardTemplate, isDeletingCardTemplate, isDeleteCardTemplateError, resetDeleteCardTemplate } =
    useDeleteCardTemplate()

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeletingCardTemplate) return
    if (!nextOpen) resetDeleteCardTemplate()
    onOpenChange(nextOpen)
  }

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (!template) return

    resetDeleteCardTemplate()
    deleteCardTemplate(template.id, {
      onSuccess: () => {
        onDeleted?.()
        onOpenChange(false)
      }
    })
  }

  if (!template) return null

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('cardTemplates.deleteAction.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('cardTemplates.deleteAction.description')}</AlertDialogDescription>
        </AlertDialogHeader>

        {isDeleteCardTemplateError && (
          <div
            role='alert'
            className='flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'
          >
            <CircleAlertIcon className='mt-0.5 size-4 shrink-0' />
            <span>{t('cardTemplates.deleteAction.failed')}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingCardTemplate}>{t('common.button.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20'
            disabled={isDeletingCardTemplate}
            onClick={handleDelete}
          >
            {isDeletingCardTemplate && <Spinner />}
            {t(`cardTemplates.deleteAction.${isDeleteCardTemplateError ? 'retry' : 'confirm'}`)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCardTemplateDialog
