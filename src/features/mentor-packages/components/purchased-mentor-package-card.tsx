import { Progress } from '@/components/ui/progress'
import { MeetingStatus } from '@/features/meetings/types'
import { format } from 'date-fns'
import { AlertCircleIcon, ClockIcon, FolderIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PurchasedMentorPackage } from '../types'

interface PurchasedMentorPackageCardProps {
  mentorPackage: PurchasedMentorPackage
  displayProject?: boolean
}

export default function PurchasedMentorPackageCard({
  mentorPackage,
  displayProject = true
}: PurchasedMentorPackageCardProps) {
  const { t } = useTranslation()

  const progress =
    ((mentorPackage?.meetings?.filter((meeting) => meeting.status === MeetingStatus.COMPLETED).length || 0) /
      Math.max(1, mentorPackage?.totalSessions ?? 1)) *
    100

  return (
    <div className='space-y-3'>
      <div className='h-36 w-full relative'>
        <img
          src={mentorPackage.coverImageUrl ?? ''}
          alt={mentorPackage.name}
          className='w-full h-full object-cover transition duration-300 hover:brightness-80'
        />
        {mentorPackage.isNeedFeedback ? (
          <div className='absolute top-1.5 right-1.5 bg-orange-500 text-white text-xs font-bold p-1 rounded-sm'>
            <AlertCircleIcon className='size-5' />
          </div>
        ) : null}
      </div>

      <div>
        {displayProject && mentorPackage.project ? (
          <div className='h-4 flex items-center gap-1'>
            <FolderIcon className='size-3' />
            <p className='text-xs truncate'>{mentorPackage.project.name}</p>
          </div>
        ) : (
          <div className='h-4 flex items-center gap-1'>
            <ClockIcon className='size-3' />
            <p className='text-xs'>{format(new Date(mentorPackage.createdOnUtc), 'dd/MM/yyyy')}</p>
          </div>
        )}

        <div className='-space-y-1'>
          <p className='text-lg font-semibold truncate'>{mentorPackage.name}</p>
          <p className='text-sm text-muted-foreground'>
            {mentorPackage.mentor.firstName} {mentorPackage.mentor.lastName}
          </p>
        </div>
      </div>

      <div className='space-y-0.5'>
        <Progress value={progress} className='h-1' />
        <p className='text-xs text-foreground/80 font-medium'>
          {t('purchasedPackage.completedProgress', { progress: progress.toFixed(0) })}
        </p>
      </div>
    </div>
  )
}
