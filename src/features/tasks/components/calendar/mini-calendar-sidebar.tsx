import { Calendar } from '@/components/ui/calendar'
import { useEffect, useState } from 'react'

interface MiniCalendarSidebarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function MiniCalendarSidebar({ selectedDate, onDateSelect }: MiniCalendarSidebarProps) {
  const [month, setMonth] = useState<Date>(selectedDate)

  useEffect(() => {
    setMonth(selectedDate)
  }, [selectedDate])

  return (
    <div className='hidden lg:block'>
      <Calendar
        mode='single'
        selected={selectedDate}
        month={month}
        onMonthChange={setMonth}
        onSelect={(date) => {
          if (date) {
            onDateSelect(date)
          }
        }}
        className='p-0'
      />
    </div>
  )
}
