import { Progress } from '@/components/ui/progress'
import { MeetingStatus } from '@/types/meeting.type'
import type { PurchasedMentorPackage } from '@/types/mentor-package.type'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface PurchasedMentorPackageCardProps {
  mentorPackage: PurchasedMentorPackage
}

export default function PurchasedMentorPackageCard({ mentorPackage }: PurchasedMentorPackageCardProps) {
  const { t } = useTranslation()

  const progress =
    ((mentorPackage?.meetings?.filter((meeting) => meeting.status === MeetingStatus.COMPLETED).length || 0) /
      Math.max(1, mentorPackage?.totalSessions ?? 1)) *
    100

  return (
    <Link to={`packages/${mentorPackage.packageBookingId}`}>
      <div className='space-y-3'>
        <div className='h-36 w-full'>
          <img
            src={mentorPackage.coverImageUrl ?? ''}
            alt={mentorPackage.name}
            className='w-full h-full object-cover transition duration-300 hover:brightness-80'
          />
        </div>

        <div className='-space-y-1.5'>
          <p className='text-lg font-semibold truncate'>{mentorPackage.name}</p>
          <Link to={`/users/${mentorPackage.mentorUserId}`}>
            <p className='text-sm text-muted-foreground hover:text-primary inline-block hover:underline'>
              {mentorPackage.mentor.firstName} {mentorPackage.mentor.lastName}
            </p>
          </Link>
        </div>

        <div className='space-y-0.5'>
          <Progress value={progress} className='h-1' />
          <p className='text-xs text-foreground/80 font-medium'>
            {t('purchasedPackage.completedProgress', { progress: progress.toFixed(0) })}
          </p>
        </div>
      </div>
    </Link>
  )
}
