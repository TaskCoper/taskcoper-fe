import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

// Key trong một palette có dạng `<prefix><suffix>`, ví dụ banners.hero. Người dùng tự nhập phần
// suffix lúc tạo và nó phải ở dạng slug; lưu xong thì key bị khoá.
export const COLLECTION_KEY_SUFFIX_PATTERN = /^[a-z0-9][a-z0-9-]*$/

type Lang = 'vi' | 'en'

// Dùng render prop chứ không phải hai input controlled: Radix unmount `TabsContent` đang ẩn, nên
// giá trị phải nằm ở state của caller, nếu không chuyển sang EN rồi quay lại sẽ mất chữ VI.
// Component này chỉ quyết định locale nào đang hiện. Label nhận qua prop vì key trong namespace
// của tenant là chuỗi không có kiểu.
export function LocalizedTabs({
  viLabel,
  enLabel,
  renderField
}: {
  viLabel: string
  enLabel: string
  renderField: (lang: Lang) => ReactNode
}) {
  return (
    <Tabs defaultValue='vi'>
      <TabsList className='h-8'>
        <TabsTrigger value='vi' className='text-xs'>
          {viLabel}
        </TabsTrigger>
        <TabsTrigger value='en' className='text-xs'>
          {enLabel}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='vi' className='mt-2'>
        {renderField('vi')}
      </TabsContent>
      <TabsContent value='en' className='mt-2'>
        {renderField('en')}
      </TabsContent>
    </Tabs>
  )
}

// Chốt giá trị khi nhấn Enter, dấu phẩy, dán chuỗi có dấu phân cách, và khi blur. Blur mới là
// trường hợp quan trọng: các input này nằm trong form mà nút Lưu chỉ cách một cú nhấp, phần đang
// gõ dở sẽ âm thầm mất khỏi document đã lưu. Backspace lúc ô trống xoá chip cuối, để sửa một id
// gõ nhầm mà không cần tới chuột.
export function ChipInput({
  values,
  onChange,
  placeholder
}: {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const parts = raw
      .split(/[,\n\t]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...values]
    for (const p of parts) if (!next.includes(p)) next.push(p)
    onChange(next)
    setDraft('')
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-xl border bg-background p-2'>
      {values.map((v) => (
        <Badge key={v} variant='secondary' className='gap-1 font-mono'>
          {v}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-3.5 text-muted-foreground hover:bg-transparent hover:text-destructive'
            onClick={() => onChange(values.filter((x) => x !== v))}
            aria-label='remove'
          >
            <X className='size-3' />
          </Button>
        </Badge>
      ))}

      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit(draft)
          } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
            onChange(values.slice(0, -1))
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (/[,\n\t]/.test(text)) {
            e.preventDefault()
            commit(text)
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={placeholder}
      />
    </div>
  )
}
