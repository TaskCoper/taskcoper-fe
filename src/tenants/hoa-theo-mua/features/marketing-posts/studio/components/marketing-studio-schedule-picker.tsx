import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDateFormat } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

const maxDate = new Date(new Date().getFullYear() + 10, 11, 31)

const pad = (value: number) => String(value).padStart(2, '0')

// Tách hẳn giờ và phút thành hai ô: gộp một danh sách thì phải cuộn mỏi tay, còn ô type='time'
// thì phải nhích từng đoạn giờ rồi phút, cả hai đều khó trúng.
const HOURS = Array.from({ length: 24 }, (_, hour) => pad(hour))
const MINUTES = Array.from({ length: 60 }, (_, minute) => pad(minute))

// Ghép ngày + giờ thành chuỗi datetime-local, giữ đúng giờ địa phương.
// Dùng toISOString() ở đây là sai: nó quy về UTC nên hẹn 8h sáng có thể nhảy sang ngày hôm trước.
const buildValue = (date: Date, time: string) => {
  const [hours = '00', minutes = '00'] = time.split(':')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${hours}:${minutes}`
}

const toDate = (value: string | null) => {
  if (!value) return undefined

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

// Panel chốt đăng chạy bằng state thường chứ không phải react-hook-form, mà DatePickerField và
// TimeInputField đều bắt buộc có `control`. Nên ghép lại từ chính những mảnh chúng dùng, theo
// đúng cách date-popover của task đang làm với state thường.
const MarketingStudioSchedulePicker = ({
  value,
  isDisabled,
  onChange
}: {
  value: string | null
  isDisabled: boolean
  onChange: (value: string) => void
}) => {
  const { t } = useTenantTranslation()
  const { formatDate } = useDateFormat()
  const [open, setOpen] = useState(false)

  const selectedDate = toDate(value)
  const time = value?.split('T')[1]?.slice(0, 5) ?? ''
  // Hẹn lịch chỉ có nghĩa ở tương lai nên chặn mọi ngày đã qua
  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)

  const [hour = '', minute = ''] = time ? time.split(':') : []

  const applyTime = (nextHour: string, nextMinute: string) =>
    onChange(buildValue(selectedDate ?? minDate, `${nextHour}:${nextMinute}`))

  return (
    <div className='flex items-center gap-1.5'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={isDisabled}
            className={cn(
              'h-8 min-w-0 flex-1 justify-start px-2 text-left text-xs font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='size-4 opacity-50' />
            <span className='truncate'>
              {selectedDate ? formatDate(selectedDate, 'dateShort') : t('datePickerField.placeholder')}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='start'
          sideOffset={8}
          className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] w-auto overflow-y-auto p-0'
        >
          <Calendar
            mode='single'
            defaultMonth={selectedDate}
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return

              onChange(buildValue(date, time || '09:00'))
              setOpen(false)
            }}
            disabled={{ before: minDate }}
            startMonth={minDate}
            endMonth={maxDate}
          />
        </PopoverContent>
      </Popover>

      <div className='flex shrink-0 items-center gap-1'>
        <Select value={hour} disabled={isDisabled} onValueChange={(next) => applyTime(next, minute || '00')}>
          <SelectTrigger
            aria-label={t('marketingPosts.studio.schedule.pickHour')}
            className='h-8 w-14 px-2 text-xs data-size:h-8'
          >
            <SelectValue placeholder='--' />
          </SelectTrigger>
          <SelectContent className='max-h-60 min-w-14'>
            {HOURS.map((option) => (
              <SelectItem key={option} value={option} className='text-xs'>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className='text-xs text-muted-foreground'>:</span>

        <Select value={minute} disabled={isDisabled} onValueChange={(next) => applyTime(hour || '09', next)}>
          <SelectTrigger
            aria-label={t('marketingPosts.studio.schedule.pickMinute')}
            className='h-8 w-14 px-2 text-xs data-size:h-8'
          >
            <SelectValue placeholder='--' />
          </SelectTrigger>
          <SelectContent className='max-h-60 min-w-14'>
            {MINUTES.map((option) => (
              <SelectItem key={option} value={option} className='text-xs'>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default MarketingStudioSchedulePicker
