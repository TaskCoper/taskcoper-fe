import { Input } from '@/components/ui/input'
import { cn } from '@/shared/utils'
import { useRef, type ComponentProps } from 'react'
import { isHashtagToken } from '../hashtags'

// Input thường không tô màu được từng chữ, nên đặt một lớp gương ngay phía sau: lớp gương vẽ chữ
// có màu, còn chữ thật của input để trong suốt và chỉ chừa lại con trỏ. Hai lớp phải trùng khít
// font, cỡ chữ và padding, lệch một chút là chữ bị nhòe đôi.
const MIRROR_TYPOGRAPHY = 'px-3 py-1 text-base md:text-sm'

const MarketingPostHashtagInput = ({
  value,
  className,
  onScroll,
  ...props
}: Omit<ComponentProps<typeof Input>, 'value'> & { value: string }) => {
  const mirrorRef = useRef<HTMLDivElement>(null)

  return (
    <div className='relative'>
      <div
        ref={mirrorRef}
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center overflow-hidden leading-8 whitespace-pre',
          MIRROR_TYPOGRAPHY
        )}
      >
        {/* Giữ nguyên cả khoảng trắng người dùng gõ, tách ra chỉ để biết mẩu nào tô màu */}
        {value.split(/(\s+)/).map((token, index) => (
          <span
            key={`${token}-${index}`}
            className={cn(isHashtagToken(token) ? 'font-medium text-sky-600 dark:text-sky-400' : 'text-foreground')}
          >
            {token}
          </span>
        ))}
      </div>

      <Input
        {...props}
        value={value}
        // Lớp gương không cuộn theo được nên phải đẩy nó bám đúng vị trí cuộn của input
        onScroll={(event) => {
          if (mirrorRef.current) mirrorRef.current.scrollLeft = event.currentTarget.scrollLeft
          onScroll?.(event)
        }}
        className={cn(
          'relative bg-transparent text-transparent caret-foreground selection:bg-primary/25 selection:text-transparent',
          className
        )}
      />
    </div>
  )
}

export default MarketingPostHashtagInput
