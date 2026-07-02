import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

// Keys within a palette are `<prefix><suffix>`, e.g. banners.hero.
// The suffix is edited by the user at creation time and must slug-shape;
// once saved the key is locked.
export const COLLECTION_KEY_SUFFIX_PATTERN = /^[a-z0-9][a-z0-9-]*$/

export function CollectionKeyField({
  prefix,
  suffix,
  onChange,
  locked,
  label,
  description,
  placeholder,
  takenSuffixes,
  duplicateHint,
  invalidHint,
  requiredHint
}: {
  prefix: string
  suffix: string
  onChange: (next: string) => void
  locked: boolean
  label: string
  description?: string
  placeholder?: string
  takenSuffixes?: Set<string>
  duplicateHint?: string
  invalidHint?: string
  requiredHint?: string
}) {
  const trimmed = suffix.trim()
  const isDuplicate = !locked && trimmed.length > 0 && !!takenSuffixes?.has(trimmed)
  const isInvalidShape = !locked && trimmed.length > 0 && !COLLECTION_KEY_SUFFIX_PATTERN.test(trimmed)
  const isEmpty = !locked && trimmed.length === 0
  const error = isEmpty ? requiredHint : isInvalidShape ? invalidHint : isDuplicate ? duplicateHint : undefined

  return (
    <Field className='gap-1'>
      <FieldLabel className='text-xs'>{label}</FieldLabel>
      <div className='flex items-stretch overflow-hidden rounded-md border bg-background focus-within:ring-1 focus-within:ring-ring'>
        <span className='flex items-center border-r bg-muted px-2 font-mono text-xs text-muted-foreground'>
          {prefix}
        </span>
        <Input
          value={suffix}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className='rounded-none border-0 font-mono text-sm shadow-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-100'
        />
      </div>
      {description && !error && <FieldDescription className='text-xs'>{description}</FieldDescription>}
      {error && <FieldDescription className='text-xs text-destructive'>{error}</FieldDescription>}
    </Field>
  )
}

type Lang = 'vi' | 'en'

// Tabs that switch between VI/EN locales for a localized field group.
// Labels are passed in by the caller so the same component fits any dialog's translation namespace.
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

// Tag-style multi-value input (used for category IDs across palettes).
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
