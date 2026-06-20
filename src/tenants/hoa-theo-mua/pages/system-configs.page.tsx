import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import ConfigKeyEditor from '../features/configs/components/config-key-editor'
import { buildPayload } from '../features/configs/config-utils'
import { useCreateConfig } from '../features/configs/hooks/use-create-config'
import { useDeleteConfig } from '../features/configs/hooks/use-delete-config'
import { useGetConfigs } from '../features/configs/hooks/use-get-configs'
import { useUpdateConfig } from '../features/configs/hooks/use-update-config'
import type { ConfigInputType, ConfigRecord } from '../features/configs/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_BADGE_CLASSES: Record<ConfigInputType, string> = {
  text: 'bg-blue-100 text-blue-700',
  number: 'bg-orange-100 text-orange-700',
  currency: 'bg-orange-100 text-orange-700',
  percentage: 'bg-orange-100 text-orange-700',
  select: 'bg-blue-100 text-blue-700',
  address: 'bg-purple-100 text-purple-700',
  checkbox: 'bg-green-100 text-green-700',
  'switch-group': 'bg-purple-100 text-purple-700',
  date: 'bg-amber-100 text-amber-700',
  dateRange: 'bg-amber-100 text-amber-700'
}

function makeNewConfig(): ConfigRecord {
  return {
    id: crypto.randomUUID(),
    key: 'newConfigKey',
    userId: '',
    value: {
      group: 'general',
      label: '',
      description: '',
      inputType: 'text',
      value: ''
    },
    _isNew: true
  }
}

// ─── Left panel list item ─────────────────────────────────────────────────────

function ConfigKeyItem({
  config,
  isSelected,
  onSelect
}: {
  config: ConfigRecord
  isSelected: boolean
  onSelect: () => void
}) {
  const isActive = config.value.active !== false
  const isNew = config._isNew

  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-muted/60'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex min-w-0 items-start gap-2'>
          <span
            className={cn(
              'mt-1.5 size-1.5 shrink-0 rounded-full',
              isNew ? 'bg-indigo-400' : isActive ? 'bg-green-500' : 'bg-gray-300'
            )}
          />
          <div className='min-w-0'>
            <p className='truncate font-mono text-[13px] font-semibold leading-snug'>{config.key}</p>
            {config.value.label && (
              <p className='text-muted-foreground mt-0.5 truncate text-xs'>{config.value.label}</p>
            )}
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium',
            TYPE_BADGE_CLASSES[config.value.inputType]
          )}
        >
          {config.value.inputType}
        </span>
      </div>
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message, desc }: { message: string; desc: string }) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 p-12 text-center'>
      <p className='text-sm font-medium'>{message}</p>
      <p className='text-muted-foreground text-xs'>{desc}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemConfigsPage() {
  const { t } = useTenantTranslation()
  const { configs, isLoadingConfigs, refetchConfigs, totalCount } = useGetConfigs()
  const { mutateAsync: createConfig, isPending: isCreating } = useCreateConfig()
  const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateConfig()
  const { mutateAsync: deleteConfig } = useDeleteConfig()

  const [localNewConfigs, setLocalNewConfigs] = useState<ConfigRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ConfigRecord | null>(null)
  const [search, setSearch] = useState('')

  const allConfigs = [...localNewConfigs, ...configs]

  // Filter
  const q = search.toLowerCase()
  const filtered = q
    ? allConfigs.filter(
        (c) =>
          c.key.toLowerCase().includes(q) ||
          c.value.label.toLowerCase().includes(q) ||
          c.value.group.toLowerCase().includes(q) ||
          (c.value.description ?? '').toLowerCase().includes(q)
      )
    : allConfigs

  // Group
  const grouped = filtered.reduce<Record<string, ConfigRecord[]>>((acc, c) => {
    const g = c.value.group || 'general'
    if (!acc[g]) acc[g] = []
    acc[g].push(c)
    return acc
  }, {})

  // All unique groups for autocomplete
  const allGroups = [...new Set(allConfigs.map((c) => c.value.group).filter(Boolean))]

  const totalPages = Math.ceil((totalCount + localNewConfigs.length) / 100) || 1
  const showPagination = totalCount > 0

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelect = (config: ConfigRecord) => {
    setSelectedId(config.id)
    setDraft(JSON.parse(JSON.stringify(config)))
  }

  const handleNewKey = () => {
    const newCfg = makeNewConfig()
    setLocalNewConfigs((prev) => [newCfg, ...prev])
    handleSelect(newCfg)
  }

  const handleCancel = () => {
    if (!draft) return
    const original = allConfigs.find((c) => c.id === draft.id)
    if (original) {
      setDraft(JSON.parse(JSON.stringify(original)))
    } else {
      setSelectedId(null)
      setDraft(null)
    }
  }

  const handleSave = async () => {
    if (!draft) return
    try {
      const payload = buildPayload(draft)
      if (draft._isNew) {
        const result = await createConfig(payload)
        setLocalNewConfigs((prev) => prev.filter((c) => c.id !== draft.id))
        if (result) {
          setSelectedId(result.id)
          setDraft(result)
        }
        toast.success(t('configKeys.toast.created'))
      } else {
        const result = await updateConfig({ id: draft.id, body: payload })
        if (result) setDraft(result)
        toast.success(t('configKeys.toast.updated'))
      }
    } catch {
      toast.error(t('configKeys.toast.error'))
    }
  }

  const handleDelete = async () => {
    if (!draft) return

    if (draft._isNew) {
      setLocalNewConfigs((prev) => prev.filter((c) => c.id !== draft.id))
      setSelectedId(null)
      setDraft(null)
      return
    }

    const deletedId = draft.id
    setSelectedId(null)
    setDraft(null)

    try {
      await deleteConfig({ id: deletedId })
      toast.success(t('configKeys.toast.deleted'))
    } catch {
      toast.error(t('configKeys.toast.error'))
      refetchConfigs()
    }
  }

  const handleDuplicate = () => {
    if (!draft) return
    const copy: ConfigRecord = {
      ...JSON.parse(JSON.stringify(draft)),
      id: crypto.randomUUID(),
      key: `${draft.key}Copy`,
      _isNew: true
    }
    setLocalNewConfigs((prev) => [copy, ...prev])
    handleSelect(copy)
  }

  const handleCopyJson = async () => {
    if (!draft) return
    const json = JSON.stringify(buildPayload(draft), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      toast.success(t('configKeys.toast.copied'))
    } catch {
      toast.error(t('configKeys.toast.copyFailed'))
    }
  }

  const isSaving = isCreating || isUpdating

  return (
    <div className='flex h-full overflow-hidden'>
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className='flex w-96 shrink-0 flex-col border-r bg-white'>
        {/* Header */}
        <div className='flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3'>
          <h2 className='text-sm font-semibold'>{t('configKeys.title')}</h2>
          <div className='flex items-center gap-1.5'>
            <Button
              size='icon'
              variant='ghost'
              className='size-7'
              onClick={() => refetchConfigs()}
              disabled={isLoadingConfigs}
            >
              <RefreshCwIcon className={cn('size-3.5', isLoadingConfigs && 'animate-spin')} />
            </Button>
            <Button
              size='sm'
              className='h-7 gap-1 px-2.5 text-xs bg-white border shadow-sm hover:bg-muted/50 text-foreground font-medium'
              variant='outline'
              onClick={handleNewKey}
            >
              {t('configKeys.newKey')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className='shrink-0 border-b px-3 py-2'>
          <Input
            placeholder={t('configKeys.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 text-sm'
          />
        </div>

        {/* List */}
        <div className='flex-1 overflow-y-auto p-2'>
          {isLoadingConfigs ? (
            <div className='space-y-2 p-1'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-14 w-full rounded-lg' />
              ))}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <p className='text-muted-foreground p-4 text-center text-xs'>{t('configKeys.emptyList')}</p>
          ) : (
            <div className='space-y-4'>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className='text-muted-foreground mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest'>
                    {group}
                  </p>
                  <div className='space-y-0.5'>
                    {items.map((cfg) => (
                      <ConfigKeyItem
                        key={cfg.id}
                        config={cfg}
                        isSelected={selectedId === cfg.id}
                        onSelect={() => handleSelect(cfg)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className='text-muted-foreground shrink-0 border-t px-4 py-2 text-[11px]'>
            {t('configKeys.page', { current: 1, total: totalPages, count: totalCount + localNewConfigs.length })}
          </div>
        )}
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      {draft ? (
        <ConfigKeyEditor
          draft={draft}
          allGroups={allGroups}
          onChange={setDraft}
          onSave={handleSave}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onCancel={handleCancel}
          onCopyJson={handleCopyJson}
          isSaving={isSaving}
        />
      ) : (
        <EmptyState message={t('configKeys.noSelection')} desc={t('configKeys.noSelectionDesc')} />
      )}
    </div>
  )
}
