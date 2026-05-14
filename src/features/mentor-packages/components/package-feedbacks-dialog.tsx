import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import PackageFeedbackCard from '@/features/feedbacks/components/package-feedback-card'
import { useGetFeedbacksInfinite } from '@/features/feedbacks/hooks/use-get-feedbacks-infinite'
import { BoxIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router'

interface PackageFeedbacksDialogProps {
  children: React.ReactNode
}

export default function PackageFeedbacksDialog({ children }: PackageFeedbacksDialogProps) {
  const { t } = useTranslation()
  const { packageId } = useParams<{ packageId: string }>()
  const [open, setOpen] = useState(false)

  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1, root: scrollContainer })

  const { feedbacks, totalCount, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetFeedbacksInfinite({
    targetType: 'MentorPackage',
    targetId: packageId,
    pageSize: 8,
    enabled: open
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent position='top-center' className='min-w-7xl'>
        <DialogHeader>
          <DialogTitle>{t('mentorPackage.page.feedbackTitle')}</DialogTitle>
          <DialogDescription>{t('mentorPackage.page.feedbackDescription', { totalCount })}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center py-10'>
            <Spinner />
          </div>
        ) : feedbacks.length ? (
          <div ref={setScrollContainer} className='space-y-3 overflow-y-auto pr-2'>
            {feedbacks.map((feedback) => (
              <PackageFeedbackCard key={feedback.id} feedback={feedback} />
            ))}

            {hasNextPage ? (
              <div ref={loadMoreRef} className='flex justify-center py-2'>
                {isFetchingNextPage ? <Spinner /> : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center gap-2 rounded-md bg-muted p-8'>
            <BoxIcon className='size-6 text-muted-foreground' />
            <p className='text-xs text-muted-foreground'>{t('purchasedPackage.noFeedback')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
