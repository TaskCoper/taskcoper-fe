import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { SaveIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useUpdateSystemPrompt } from '../hooks/use-update-system-prompt'
import SystemPromptEditor from './system-prompt-editor'
import type { SystemPromptDetail } from '../types'
import { SYSTEM_PROMPT_MAX_LENGTH, systemPromptSchema, type SystemPromptFormValues } from '../validations'

interface EditSystemPromptDialogProps {
  systemPrompt: SystemPromptDetail | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getContentError = (error: unknown) => {
  if (!isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return undefined

  const errors = (error.response.data as Record<string, unknown>).errors
  if (!errors || typeof errors !== 'object') return undefined

  const contentError = Object.entries(errors as Record<string, unknown>).find(([key]) =>
    key.toLowerCase().includes('content')
  )?.[1]

  if (typeof contentError === 'string') return contentError
  if (Array.isArray(contentError)) return contentError.find((message): message is string => typeof message === 'string')

  return undefined
}

export default function EditSystemPromptDialog({ systemPrompt, open, onOpenChange }: EditSystemPromptDialogProps) {
  const { t } = useTenantTranslation()
  const schema = useMemo(() => systemPromptSchema(t), [t])
  const { updateSystemPrompt, isUpdatingSystemPrompt } = useUpdateSystemPrompt()
  const methods = useForm<SystemPromptFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: systemPrompt?.content ?? '' }
  })
  const content = useWatch({ control: methods.control, name: 'content' })

  useEffect(() => {
    if (open) methods.reset({ content: systemPrompt?.content ?? '' })
  }, [methods, open, systemPrompt?.content])

  const handleSubmit = methods.handleSubmit(async (values) => {
    if (!systemPrompt) return

    try {
      await updateSystemPrompt({ id: systemPrompt.id, body: values })
      onOpenChange(false)
    } catch (error) {
      const contentError = getContentError(error)
      if (contentError) methods.setError('content', { type: 'server', message: contentError })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{t('systemPrompts.edit.title')}</DialogTitle>
          <DialogDescription>{t('systemPrompts.edit.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Controller
            name='content'
            control={methods.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                <div className='flex items-center justify-between gap-4'>
                  <FieldLabel>{t('systemPrompts.contentLabel')}</FieldLabel>
                  <span
                    className={
                      content.length > SYSTEM_PROMPT_MAX_LENGTH
                        ? 'text-xs font-medium text-destructive'
                        : 'text-xs text-muted-foreground'
                    }
                  >
                    {content.length.toLocaleString()}/{SYSTEM_PROMPT_MAX_LENGTH.toLocaleString()}
                  </span>
                </div>
                <SystemPromptEditor
                  content={field.value}
                  onChange={field.onChange}
                  className='min-h-[min(42vh,26rem)] max-h-[min(52vh,32rem)] max-w-none text-sm'
                />
                <div className='min-h-5'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isUpdatingSystemPrompt}
            >
              {t('common.button.cancel')}
            </Button>
            <Button type='submit' disabled={isUpdatingSystemPrompt || !methods.formState.isDirty}>
              {isUpdatingSystemPrompt ? <Spinner /> : <SaveIcon />}
              {t('systemPrompts.actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
