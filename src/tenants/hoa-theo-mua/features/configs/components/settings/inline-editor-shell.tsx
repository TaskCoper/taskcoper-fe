import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ArrowLeft, SaveIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { useRegisterDirtyRow } from '../../state/dirty-registry-hooks'

export interface InlineEditorShellProps {
  editorId: string
  icon?: ReactNode
  title: string
  description?: string
  children: ReactNode
  isDirty: boolean
  isSaving: boolean
  onRevert: () => void
  onSave: () => void
  onBack?: () => void
  saveDisabledReason?: string
  secondaryAction?: ReactNode
}

export default function InlineEditorShell({
  editorId,
  icon,
  title,
  description,
  children,
  isDirty,
  isSaving,
  onRevert,
  onSave,
  onBack,
  saveDisabledReason,
  secondaryAction
}: InlineEditorShellProps) {
  const { t } = useTenantTranslation()

  const containerRef = useRegisterDirtyRow({
    configId: editorId,
    configKey: editorId,
    isDirty,
    isSaving,
    onReset: onRevert
  })

  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [editorId])

  return (
    <section
      ref={containerRef}
      tabIndex={-1}
      data-editor-id={editorId}
      aria-labelledby={`editor-title-${editorId}`}
      className='outline-none flex flex-col flex-1'
    >
      <div className='p-4 flex items-center gap-2.5 border-b border-border'>
        {onBack && (
          <Button type='button' variant='ghost' size='icon' className='shrink-0' onClick={onBack}>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t('common.button.back')}</span>
          </Button>
        )}

        {icon && (
          <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary'>
            {icon}
          </span>
        )}

        <div className='min-w-0 flex-1 -space-y-0.5'>
          <h3
            id={`editor-title-${editorId}`}
            ref={headingRef}
            tabIndex={-1}
            className='truncate text-lg font-semibold outline-none'
          >
            {title}
          </h3>

          {description && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>
      </div>

      <div data-dirty-focus className='flex-1 space-y-8 p-4'>
        {children}
      </div>

      <div className='sticky bottom-0 z-10 mt-6 flex items-center justify-end gap-2 border-t bg-card px-4 py-3'>
        {secondaryAction && <div className='mr-auto'>{secondaryAction}</div>}
        {saveDisabledReason && <p className='mr-auto text-xs text-muted-foreground'>{saveDisabledReason}</p>}

        <Button type='button' variant='ghost' disabled={!isDirty || isSaving} onClick={onRevert}>
          {t('configsPage.card.revert')}
        </Button>
        {onBack && (
          <Button type='button' variant='outline' disabled={isSaving} onClick={onBack}>
            {t('configsPage.dialog.cancel')}
          </Button>
        )}
        <Button
          type='button'
          disabled={!isDirty || isSaving || !!saveDisabledReason}
          onClick={onSave}
          className={cn('shrink-0')}
        >
          {isSaving ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
          {isSaving ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
        </Button>
      </div>
    </section>
  )
}
