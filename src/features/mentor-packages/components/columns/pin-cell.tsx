import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { StarIcon } from 'lucide-react'
import { useUpdateMentorPackage } from '../../hooks/use-update-mentor-package'
import type { MentorPackage } from '../../types'

export default function PinCell({ row }: { row: { original: MentorPackage } }) {
  const mentorPackage = row.original
  const { updateMentorPackage, isUpdatingMentorPackage } = useUpdateMentorPackage()

  const handleTogglePin = () => {
    updateMentorPackage({
      body: {
        mentorPackageId: mentorPackage.id,
        name: mentorPackage.name,
        description: mentorPackage.description,
        totalSessions: mentorPackage.totalSessions.toString(),
        price: mentorPackage.price.toString(),
        currency: mentorPackage.currency,
        coverImageUrl: mentorPackage.coverImageUrl,
        isActive: mentorPackage.isActive,
        isPin: !mentorPackage.isPin,
        activationDeadlineDays: mentorPackage.activationDeadlineDays,
        usageDeadlineDays: mentorPackage.usageDeadlineDays
      }
    })
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      className='size-8 text-muted-foreground hover:text-orange-500'
      onClick={handleTogglePin}
      disabled={isUpdatingMentorPackage}
    >
      {isUpdatingMentorPackage ? (
        <Spinner />
      ) : (
        <StarIcon className={mentorPackage.isPin ? 'size-4 fill-orange-400 text-orange-400' : 'size-4'} />
      )}
    </Button>
  )
}
