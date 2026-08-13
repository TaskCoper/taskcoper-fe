import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { X } from 'lucide-react'
import { useRef, useState } from 'react'
import { isValidPagePattern, PAGE_PATTERN_PRESETS } from '../promotion-popup-palette'

const isExclusion = (pattern: string): boolean => pattern.trim().startsWith('!')

/**
 * Editor for a `pages` list of route patterns, validated as-typed.
 * `inheritedFrom` set means an empty list inherits the section's scope.
 */
export function PromotionPagesField({
  label,
  description,
  value,
  onChange,
  inheritedFrom,
  error
}: {
  label: string
  description: string
  value: string[]
  onChange: (next: string[]) => void
  inheritedFrom?: string[]
  // Only set for invalid patterns already stored in JSON.
  error?: string
}) {
  const { t } = useTenantTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')

  const trimmedDraft = draft.trim()
  const isInvalid = trimmedDraft.length > 0 && !isValidPagePattern(trimmedDraft)

  const add = (pattern: string) => {
    const next = pattern.trim()
    if (!next || !isValidPagePattern(next) || value.includes(next)) return
    onChange([...value, next])
    setDraft('')
  }

  const presets = PAGE_PATTERN_PRESETS.filter((pattern) => !value.includes(pattern))

  const hint = inheritedFrom
    ? t('configsPage.promotionPopupDialog.pages.inherits', {
        patterns: inheritedFrom.join(', ') || t('configsPage.promotionPopupDialog.pages.everywhere')
      })
    : t('configsPage.promotionPopupDialog.pages.emptyMeansEverywhere')

  return (
    <Field className='gap-1.5'>
      <FieldLabel className='text-xs'>{label}</FieldLabel>

      {/* Chips and the input share one control so the field reads as a single input. */}
      <div
        className={cn(
          'flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 shadow-xs focus-within:ring-1 focus-within:ring-ring',
          (isInvalid || error) && 'border-destructive focus-within:ring-destructive'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((pattern) => (
          <Badge
            key={pattern}
            variant='secondary'
            className={cn(
              'h-5 gap-1 pr-1 pl-2 font-mono text-[0.6875rem] font-normal',
              // Exclusions read as "blocked here", so they carry the only colour in the row.
              isExclusion(pattern) && 'bg-destructive/10 text-destructive'
            )}
          >
            {pattern}
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-3.5 hover:bg-transparent hover:text-destructive'
              onClick={(e) => {
                e.stopPropagation()
                onChange(value.filter((item) => item !== pattern))
              }}
              aria-label={t('configsPage.promotionPopupDialog.pages.remove', { pattern })}
            >
              <X className='size-3' />
            </Button>
          </Badge>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              // The field lives inside the dialog's form; Enter must add a pattern, not save.
              e.preventDefault()
              add(draft)
            } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => add(draft)}
          placeholder={value.length === 0 ? t('configsPage.promotionPopupDialog.pages.placeholder') : ''}
          aria-label={label}
          aria-invalid={isInvalid}
          className='h-5 min-w-40 flex-1 bg-transparent font-mono text-xs outline-none placeholder:font-sans placeholder:text-muted-foreground'
        />
      </div>

      {presets.length > 0 && (
        <div className='flex flex-wrap items-center gap-1'>
          {presets.map((pattern) => (
            <button
              key={pattern}
              type='button'
              onClick={() => add(pattern)}
              className='rounded-full border border-dashed px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground transition-colors hover:border-solid hover:bg-accent hover:text-foreground'
            >
              {pattern}
            </button>
          ))}
        </div>
      )}

      <FieldDescription className={cn('text-xs', (isInvalid || error) && 'text-destructive')}>
        {error ??
          (isInvalid ? t('configsPage.promotionPopupDialog.pages.invalid') : value.length === 0 ? hint : description)}
      </FieldDescription>
    </Field>
  )
}
