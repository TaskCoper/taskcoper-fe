import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Feedback } from '@/features/feedbacks/types'
import { useTranslation } from 'react-i18next'
import PackageFeedbackCard from './package-feedback-card'

interface PackageFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: Feedback | null
}

export default function PackageFeedbackDialog({ open, onOpenChange, feedback }: PackageFeedbackDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-4xl p-0'>
        <DialogHeader className='px-4 pt-4 pb-0'>
          <DialogTitle>{t('packageFeedback.title')}</DialogTitle>
          <DialogDescription className='sr-only'>{t('packageFeedback.description')}</DialogDescription>
        </DialogHeader>

        <div className='overflow-y-auto px-4 pb-4 pt-2'>
          {feedback ? <PackageFeedbackCard feedback={feedback} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
