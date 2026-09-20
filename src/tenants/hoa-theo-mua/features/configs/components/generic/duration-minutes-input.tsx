import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { minutesToSeconds, secondsToMinutes } from '../../duration-config-keys'

interface DurationMinutesInputProps {
  value: unknown
  onChange: (value: number | undefined) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  ariaInvalid?: boolean
  ariaDescribedBy?: string
}

// Giữ chuỗi riêng trong lúc người dùng gõ và chỉ quy đổi phút -> giây khi blur, để giá trị đang
// gõ dở (ví dụ còn dấu "." ở cuối) không bị vòng quy đổi qua giá trị giây ghi đè sau mỗi phím.
export default function DurationMinutesInput({
  value,
  onChange,
  onBlur,
  className,
  placeholder,
  ariaInvalid,
  ariaDescribedBy
}: DurationMinutesInputProps) {
  const toText = (v: unknown) => (typeof v === 'number' ? String(secondsToMinutes(v)) : '')

  const [prevValue, setPrevValue] = useState(value)
  const [text, setText] = useState(() => toText(value))

  // Đồng bộ lại chuỗi cục bộ khi giá trị giây đổi từ bên ngoài input này - ví dụ sau khi lưu hay
  // reset form - mà không đè lên phần đang gõ dở.
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
      aria-describedby={ariaDescribedBy}
    />
  )
}
