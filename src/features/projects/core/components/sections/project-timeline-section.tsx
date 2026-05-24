import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDateFormat } from '@/lib/date'
import { ChevronsRightIcon, SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import UpdateProjectTimelineDialog from '../dialogs/update-project-timeline-dialog'

interface ProjectTimelineSectionProps {
  startDate: string
  endDate: string
  isPending: boolean
  isCurrentUserMain: boolean
}

export default function ProjectTimelineSection({
  startDate,
  endDate,
  isPending,
  isCurrentUserMain
}: ProjectTimelineSectionProps) {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{t('project.info.timeline')}</p>
          <p className='text-xs text-muted-foreground'>{t('project.info.timelineDescription')}</p>
        </div>

        {isCurrentUserMain ? (
          <UpdateProjectTimelineDialog isPending={isPending}>
            <Button variant='ghost' size='icon-sm' type='button'>
              <SettingsIcon />
            </Button>
          </UpdateProjectTimelineDialog>
        ) : null}
      </div>

      <Card className='p-4 border-dashed shadow-none flex-row items-center justify-between gap-4 cursor-pointer hover:bg-muted/30'>
        <div>
          <p className='text-xs text-muted-foreground'>{t('project.info.startDate')}</p>
          <p className='font-bold text-primary'>{startDate ? formatDate(startDate, 'dateMedium') : 'N/A'}</p>
        </div>

        <ChevronsRightIcon className='size-5 text-muted-foreground' />

        <div>
          <p className='text-xs text-muted-foreground'>{t('project.info.endDate')}</p>
          <p className='font-bold text-primary'>{endDate ? formatDate(endDate, 'dateMedium') : 'N/A'}</p>
        </div>
      </Card>
    </div>
  )
}
