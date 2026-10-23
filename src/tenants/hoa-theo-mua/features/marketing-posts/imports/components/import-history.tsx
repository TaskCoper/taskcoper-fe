import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { parseAsString, useQueryState } from 'nuqs'
import z from 'zod'
import { useImportList } from '../hooks'
import ImportDetail from './import-detail'

export default function ImportHistory() {
  const { t } = useTenantTranslation()
  const list = useImportList()
  const [selected, setSelected] = useQueryState('importBatch', parseAsString)
  const id = selected ?? list.data?.[0]?.id
  if (!list.isError && !id) return null
  return (
    <section className='space-y-4 rounded-2xl border bg-background p-4 sm:p-5'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold'>{t('marketingPosts.bulkImport.history')}</h2>
          <p className='text-xs text-muted-foreground'>{t('marketingPosts.bulkImport.historyHint')}</p>
        </div>
        {!!list.data?.length && (
          <Select
            value={id}
            onValueChange={(value) => {
              void setSelected(value)
            }}
          >
            <SelectTrigger className='w-full sm:w-80' aria-label={t('marketingPosts.bulkImport.chooseBatch')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {list.data.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {formatDateTime(batch.createdAt, 'dateTimeShort')} · {batch.fileName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {list.isError && (
        <div role='alert' className='flex flex-wrap items-center gap-2 text-xs text-destructive'>
          {t('marketingPosts.bulkImport.error.loadHistory')}
          <Button size='sm' variant='ghost' onClick={() => list.refetch()}>
            {t('marketingPosts.bulkImport.refresh')}
          </Button>
        </div>
      )}
      {id &&
        (z.string().uuid().safeParse(id).success ? (
          <ImportDetail key={id} id={id} />
        ) : (
          <p className='text-sm text-destructive'>{t('marketingPosts.bulkImport.error.loadDetail')}</p>
        ))}
    </section>
  )
}
