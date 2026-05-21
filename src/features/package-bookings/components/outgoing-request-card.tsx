import { Badge } from '@/components/ui/badge'
import { PACKAGE_REQUEST_STATUS_SOLID_THEME } from '@/features/package-bookings/constants'
import { PackageRequestStatusLabel, type PackageOutgoingRequest } from '@/features/package-bookings/types'
import { format } from 'date-fns'
import i18next from 'i18next'
import { Clock3Icon, FolderIcon } from 'lucide-react'

interface OutgoingRequestCardProps {
  request: PackageOutgoingRequest
}

export default function OutgoingRequestCard({ request }: OutgoingRequestCardProps) {
  const config = PACKAGE_REQUEST_STATUS_SOLID_THEME[request.status]
  const Icon = config.icon

  return (
    <div className='space-y-3'>
      <div className='h-36 w-full relative'>
        <img
          src={request.mentorPackageCoverImageUrl ?? ''}
          alt={request.mentorPackageName}
          className='w-full h-full object-cover transition duration-300 hover:brightness-80'
        />

        <div className='absolute top-1.5 right-1.5'>
          <Badge
            variant='outline'
            className={`flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-md ${config.className}`}
          >
            <Icon className='size-3' />
            {i18next.t(PackageRequestStatusLabel[request.status])}
          </Badge>
        </div>
      </div>

      <div>
        {request.projectName ? (
          <div className='h-4 flex items-center gap-1'>
            <FolderIcon className='size-3' />
            <p className='text-xs truncate'>{request.projectName}</p>
          </div>
        ) : (
          <div className='h-4 flex items-center gap-1'>
            <Clock3Icon className='size-3 text-muted-foreground' />
            <p className='text-xs text-muted-foreground'>{format(new Date(request.createdOnUtc), 'dd/MM/yyyy')}</p>
          </div>
        )}

        <div className='-space-y-1'>
          <p className='text-lg font-semibold truncate'>{request.mentorPackageName}</p>
          <p className='text-sm text-muted-foreground'>
            {request.mentorFirstName} {request.mentorLastName}
          </p>
        </div>
      </div>
    </div>
  )
}
