import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { minutesToSeconds, secondsToMinutes } from '../duration-config-keys'

interface DurationMinutesInputProps {
  value: unknown
  onChange: (value: number | undefined) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  ariaInvalid?: boolean
}

// Keeps its own text while the user types and only commits the minutes -> seconds
// conversion on blur, so an in-progress value (e.g. a trailing ".") isn't clobbered
// by the round-trip through the stored seconds value on every keystroke.
export default function DurationMinutesInput({
  value,
  onChange,
  onBlur,
  className,
  placeholder,
  ariaInvalid
}: DurationMinutesInputProps) {
  const toText = (v: unknown) => (typeof v === 'number' ? String(secondsToMinutes(v)) : '')

  const [prevValue, setPrevValue] = useState(value)
  const [text, setText] = useState(() => toText(value))

  // Re-sync local text when the underlying (seconds) value changes from outside
  // this input - e.g. after a save or a form reset - without clobbering in-progress typing.
  if (value !== prevValue) {
    setPrevValue(value)
    setText(toText(value))
  }

  return (
    <Input
      type='number'
      className={className}
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        onChange(text === '' ? undefined : minutesToSeconds(text))
        onBlur?.()
      }}
      aria-invalid={ariaInvalid}
    />
  )
}
