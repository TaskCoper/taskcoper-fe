import { cn } from '@/shared/utils'
import { StarIcon } from 'lucide-react'

export type RatingValue = 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5

interface RatingFieldProps {
  value: RatingValue | undefined
  setValue: (value: RatingValue | undefined) => void
  className?: string
  size?: number
  max?: number
}

export default function RatingField({ value, setValue, className, size = 24, max = 5 }: RatingFieldProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const fullSelected = value !== undefined && value >= star
        const halfSelected = value !== undefined && value === star - 0.5

        return (
          <div key={star} className='relative cursor-pointer' style={{ width: size, height: size }}>
            {/* Left half – clicks set half star */}
            <button
              type='button'
              className='absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer'
              onClick={() => {
                const half = (star - 0.5) as RatingValue
                setValue(value === half ? undefined : half)
              }}
              aria-label={`${star - 0.5} stars`}
            />
            {/* Right half – clicks set full star */}
            <button
              type='button'
              className='absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer'
              onClick={() => {
                const full = star as RatingValue
                setValue(value === full ? undefined : full)
              }}
              aria-label={`${star} stars`}
            />

            {/* Background (empty) star */}
            <StarIcon size={size} className='absolute inset-0 fill-muted text-muted-foreground/15 stroke-[1.5]' />

            {/* Filled star – full or half via clip-path */}
            {(fullSelected || halfSelected) && (
              <StarIcon
                size={size}
                className={cn(
                  'absolute inset-0 fill-amber-400 text-amber-400 stroke-[1.5] transition-colors',
                  halfSelected && '[clip-path:inset(0_50%_0_0)]'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
