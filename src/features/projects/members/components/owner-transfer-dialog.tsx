import InfiniteSelect from '@/components/infinite-select'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'

interface OwnerTransferOption {
  value: string
  label: string
}

interface OwnerTransferDialogProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedNewOwnerUserId: string
  onSelectedNewOwnerUserIdChange: (userId: string) => void
  ownerCandidateOptions: OwnerTransferOption[]
  onOwnerCandidateSearch: (searchTerm: string) => void
  fetchNextOwnerCandidates: () => void
  hasNextOwnerCandidatesPage: boolean
  isFetchingNextOwnerCandidates: boolean
  isLoadingOwnerCandidates: boolean
  isSubmitting: boolean
  onConfirm: () => void
}

export default function OwnerTransferDialog({
  open,
  onOpenChange,
  selectedNewOwnerUserId,
  onSelectedNewOwnerUserIdChange,
  ownerCandidateOptions,
  onOwnerCandidateSearch,
  fetchNextOwnerCandidates,
  hasNextOwnerCandidatesPage,
  isFetchingNextOwnerCandidates,
  isLoadingOwnerCandidates,
  isSubmitting,
  onConfirm
}: OwnerTransferDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('project.updateProjectMembers.ownerTransfer.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('project.updateProjectMembers.ownerTransfer.description')}</AlertDialogDescription>
        </AlertDialogHeader>

        <InfiniteSelect
          value={selectedNewOwnerUserId}
          onChangeValue={onSelectedNewOwnerUserIdChange}
          options={ownerCandidateOptions}
          placeholder={t('project.updateProjectMembers.ownerTransfer.selectOwnerPlaceholder')}
          searchPlaceholder={t('project.updateProjectMembers.ownerTransfer.searchOwnerPlaceholder')}
          onSearch={onOwnerCandidateSearch}
          fetchNextPage={fetchNextOwnerCandidates}
          hasNextPage={hasNextOwnerCandidatesPage}
          isFetchingNextPage={isFetchingNextOwnerCandidates}
          isLoading={isLoadingOwnerCandidates}
          className='w-full'
        />

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>{t('common.button.cancel')}</AlertDialogCancel>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={!selectedNewOwnerUserId || isSubmitting}
          >
            {isSubmitting ? <Spinner /> : null}
            {t('project.updateProjectMembers.ownerTransfer.confirmText')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
