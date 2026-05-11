import RatingField, { type RatingValue } from '@/components/rating-field'
import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAvatarFallback, safeParseJson } from '@/shared/utils'
import { format } from 'date-fns'
import { StarIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { packageFeedbackQuestions } from '../constants'
import type { Feedback } from '../types'
import type { FeedbackMetadata } from '../validations'

interface PackageFeedbackCardProps {
  feedback: Feedback
}

export default function PackageFeedbackCard({ feedback }: PackageFeedbackCardProps) {
  const { t } = useTranslation()

  const metaDataObj = safeParseJson<FeedbackMetadata>(feedback.metaData)

  const metaEntries = packageFeedbackQuestions
    .filter((question) => metaDataObj[question.id] !== undefined)
    .map((question) => ({
      question,
      value: Number(metaDataObj[question.id]) as RatingValue
    }))

  return (
    <Card className='p-0 gap-0 shadow-none'>
      <div className='flex items-start justify-between p-4'>
        <div className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage src={feedback.author.avatarUrl ?? undefined} />
            <AvatarFallback>
              {getAvatarFallback(`${feedback.author.firstName} ${feedback.author.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div className='-space-y-1'>
            <p className='font-semibold text-sm'>
              {feedback.author.firstName} {feedback.author.lastName}
            </p>
            <p className='text-xs text-muted-foreground'>
              {feedback.createdOnUtc ? format(new Date(feedback.createdOnUtc), 'PPP') : ''}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-1.5 bg-orange-50 px-1.5 py-1 rounded-md border border-orange-100'>
          <StarIcon className='size-4 text-orange-600' />
          <p className='font-semibold text-orange-600 text-sm'>{Number(feedback.rating).toFixed(1)}/5.0</p>
        </div>
      </div>

      <Separator />

      {metaEntries.length > 0 && (
        <div className='space-y-2 p-4 bg-muted/50'>
          {metaEntries.map(({ question, value }) => (
            <div key={question.id} className='flex items-center justify-between'>
              <p className='text-sm text-foreground/80 font-medium'>{t(question.titleKey)}</p>

              <RatingField value={value} setValue={() => {}} size={14} max={4} className='pointer-events-none' />
            </div>
          ))}
        </div>
      )}

      <Separator />

      <SanitizedHtml html={feedback.comment} className='p-4' />
    </Card>
  )
}
