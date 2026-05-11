import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircleIcon, BriefcaseIcon, CheckCircle2Icon, ClockIcon, EyeIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApplicationStatus } from '../types'

interface ApplicationStatusFilterProps {
  value?: ApplicationStatus
  onValueChange: (value?: ApplicationStatus) => void
  containerClassName?: string
}

export function ApplicationStatusFilter({ value, onValueChange, containerClassName }: ApplicationStatusFilterProps) {
  const { t } = useTranslation()

  return (
    <Select
      value={value ?? 'all'}
      onValueChange={(val) => onValueChange(val === 'all' ? undefined : (val as ApplicationStatus))}
    >
      <SelectTrigger size='sm' className={containerClassName ?? 'w-36'}>
        <SelectValue placeholder={t('mentorApplication.list.allStatuses')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value='all'>{t('mentorApplication.list.allStatuses')}</SelectItem>
          <SelectItem value={ApplicationStatus.PENDING}>
            <span className='flex items-center gap-1.5'>
              <ClockIcon className='size-3 text-amber-500' />
              {t('mentorApplication.status.pending')}
            </span>
          </SelectItem>
          <SelectItem value={ApplicationStatus.IN_REVIEW}>
            <span className='flex items-center gap-1.5'>
              <EyeIcon className='size-3 text-blue-500' />
              {t('mentorApplication.status.inReview')}
            </span>
          </SelectItem>
          <SelectItem value={ApplicationStatus.IN_OFFERS}>
            <span className='flex items-center gap-1.5'>
              <BriefcaseIcon className='size-3 text-purple-500' />
              {t('mentorApplication.status.inOffers')}
            </span>
          </SelectItem>
          <SelectItem value={ApplicationStatus.APPROVED}>
            <span className='flex items-center gap-1.5'>
              <CheckCircle2Icon className='size-3 text-green-500' />
              {t('mentorApplication.status.approved')}
            </span>
          </SelectItem>
          <SelectItem value={ApplicationStatus.REJECTED}>
            <span className='flex items-center gap-1.5'>
              <AlertCircleIcon className='size-3 text-destructive' />
              {t('mentorApplication.status.rejected')}
            </span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
