import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/date'
import { FileSearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuditLog } from '../types'

const prettyJson = (raw: string | null): string | null => {
  if (!raw) return null
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    // Not valid JSON (should not happen for server-written snapshots) — show it verbatim.
    return raw
  }
}

interface AuditLogDetailDialogProps {
  auditLog: AuditLog
}

export default function AuditLogDetailDialog({ auditLog }: AuditLogDetailDialogProps) {
  const { t } = useTranslation()

  const previous = prettyJson(auditLog.previousJson)
  const next = prettyJson(auditLog.nextJson)
  const actorName = auditLog.actor
    ? `${auditLog.actor.firstName} ${auditLog.actor.lastName}`
    : t('project.auditLog.systemActor')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 gap-1.5'>
          <FileSearchIcon className='size-4' />
          {t('project.auditLog.viewDetails')}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {t(`project.auditLog.actions.${auditLog.action}`, { defaultValue: auditLog.action })}
          </DialogTitle>
          <DialogDescription>
            {actorName} · {formatDate(auditLog.occurredOnUtc, 'dateTimeShort')}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-1.5'>
            <p className='text-xs font-semibold text-muted-foreground'>{t('project.auditLog.before')}</p>
            <pre className='max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-all'>
              {previous ?? t('project.auditLog.noValue')}
            </pre>
          </div>
          <div className='space-y-1.5'>
            <p className='text-xs font-semibold text-muted-foreground'>{t('project.auditLog.after')}</p>
            <pre className='max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-all'>
              {next ?? t('project.auditLog.noValue')}
            </pre>
          </div>
        </div>

        {auditLog.reason ? (
          <div className='space-y-1.5'>
            <p className='text-xs font-semibold text-muted-foreground'>{t('project.auditLog.reason')}</p>
            <p className='text-sm'>{auditLog.reason}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
