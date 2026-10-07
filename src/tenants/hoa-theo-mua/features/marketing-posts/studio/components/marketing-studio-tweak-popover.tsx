import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ComponentProps } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useState, type ReactNode } from 'react'

// Select không nhận value rỗng, dùng một mã riêng cho lựa chọn "làm lại từ đầu"
const FROM_SCRATCH = 'from-scratch'

// Dùng chung cho "viết lại caption" và "cắt lại ảnh": cùng một việc - nói cho AI biết muốn
// khác chỗ nào rồi chạy lại. Chip bấm nhanh để khỏi gõ, ô ghi chú cho trường hợp cần nói rõ.
const MarketingStudioTweakPopover = <T extends string>({
  trigger,
  title,
  description,
  notePlaceholder,
  submitLabel,
  options,
  sourceLabel,
  fromScratchLabel,
  sources,
  side = 'bottom',
  align = 'end',
  onSubmit
}: {
  trigger: ReactNode
  title: string
  description: string
  notePlaceholder: string
  submitLabel: string
  options: { value: T; label: string }[]
  // Bản để AI dựa vào mà làm tiếp. Không chọn gì nghĩa là làm lại từ đầu.
  sourceLabel: string
  fromScratchLabel: string
  sources: { value: string; label: string }[]
  // Nút nằm sát mép trái màn thì mở xuống sẽ đè lên sidebar, lúc đó truyền side='right'
  side?: ComponentProps<typeof PopoverContent>['side']
  align?: ComponentProps<typeof PopoverContent>['align']
  onSubmit: (request: { tweaks: T[]; note: string; source: string | null }) => void
}) => {
  const { t } = useTenantTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [tweaks, setTweaks] = useState<T[]>([])
  const [note, setNote] = useState('')
  // Mặc định làm lại từ đầu - đúng nghĩa chữ "làm lại", và cũng là hành vi backend
  // dùng khi bỏ trống trường nguồn
  const [source, setSource] = useState(FROM_SCRATCH)

  const toggleTweak = (tweak: T) => {
    setTweaks((previous) =>
      previous.includes(tweak) ? previous.filter((item) => item !== tweak) : [...previous, tweak]
    )
  }

  const submit = () => {
    onSubmit({ tweaks, note: note.trim(), source: source === FROM_SCRATCH ? null : source })
    setIsOpen(false)
    setTweaks([])
    setNote('')
    setSource(FROM_SCRATCH)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent side={side} align={align} collisionPadding={12} className='w-80 space-y-3'>
        <div>
          <p className='text-sm font-medium'>{title}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>{description}</p>
        </div>

        {/* Chọn bản để AI dựa vào: làm lại từ đầu hay sửa tiếp trên một bản đã có */}
        <div className='space-y-1'>
          <p className='text-xs font-medium'>{sourceLabel}</p>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger size='sm' className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FROM_SCRATCH}>{fromScratchLabel}</SelectItem>
              {sources.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-wrap gap-1.5'>
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              aria-pressed={tweaks.includes(option.value)}
              onClick={() => toggleTweak(option.value)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted',
                tweaks.includes(option.value) && 'border-primary bg-primary/10 text-primary hover:bg-primary/10'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={notePlaceholder}
          className='resize-none text-sm'
        />

        <Button type='button' size='sm' className='w-full' onClick={submit}>
          {submitLabel}
        </Button>

        {/* Không chọn gì cũng chạy được, coi như bảo AI làm lại bản khác */}
        <p className='text-xs text-muted-foreground'>{t('marketingPosts.studio.regenerate.optionalNote')}</p>
      </PopoverContent>
    </Popover>
  )
}

export default MarketingStudioTweakPopover
