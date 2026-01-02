import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { format, type Locale } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import { ChevronsRightIcon, SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProjectTimelineSectionProps {
  startDate: string
  endDate: string
}

const DATE_LOCALES: Record<string, Locale> = {
  vi: vi,
  en: enUS
}

export default function ProjectTimelineSection({ startDate, endDate }: ProjectTimelineSectionProps) {
  const { t, i18n } = useTranslation()

  const currentLocale = DATE_LOCALES[i18n.language] || enUS
  const dateFormat = i18n.language === 'vi-VN' ? 'd MMM, yyyy' : 'MMM d, yyyy'

  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='font-semibold'>{t('project.info.timeline')}</p>
          <p className='text-xs text-muted-foreground'>{t('project.info.timelineDescription')}</p>
        </div>

        <Button variant='ghost' size='icon-sm'>
          <SettingsIcon />
        </Button>
      </div>

      <Card className='p-4 border-dashed shadow-none flex-row items-center justify-between gap-4 cursor-pointer hover:bg-muted/30'>
        <div>
          <p className='text-xs text-muted-foreground'>{t('project.info.startDate')}</p>
          <p className='font-bold text-primary'>
            {startDate ? format(new Date(startDate), dateFormat, { locale: currentLocale }) : 'N/A'}
          </p>
        </div>

        <ChevronsRightIcon className='size-5 text-muted-foreground' />

        <div>
          <p className='text-xs text-muted-foreground'>{t('project.info.endDate')}</p>
          <p className='font-bold text-primary'>
            {endDate ? format(new Date(endDate), dateFormat, { locale: currentLocale }) : 'N/A'}
          </p>
        </div>
      </Card>
    </div>
  )
}
