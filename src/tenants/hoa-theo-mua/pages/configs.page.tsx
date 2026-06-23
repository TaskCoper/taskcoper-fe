import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlignJustify,
  AlignLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Code2,
  EyeOff,
  Hash,
  ImageIcon,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  SaveIcon,
  ToggleLeft,
  Type
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CreateConfigDialog from '../features/configs/components/create-config-dialog'
import UpdateConfigDialog from '../features/configs/components/update-config-dialog'
import { useGetConfigs } from '../features/configs/hooks/use-get-configs'
import configService from '../features/configs/services'
import type { Config, ConfigDefinition } from '../features/configs/types'
import { INPUT_TYPE_COLOR, InputType } from '../features/configs/types'
import type { CreateConfigFormValues } from '../features/configs/validations'
import { buildValueValidator } from '../features/configs/validations'

// ─── constants ────────────────────────────────────────────────────────────────

const INPUT_TYPE_ICON: Record<InputType, React.ReactNode> = {
  [InputType.text]: <Type className='size-3' />,
  [InputType.textarea]: <AlignJustify className='size-3' />,
  [InputType.number]: <Hash className='size-3' />,
  [InputType.boolean]: <CheckCircle2 className='size-3' />,
  [InputType.switch]: <ToggleLeft className='size-3' />,
  [InputType.date]: <Calendar className='size-3' />,
  [InputType.select]: <ChevronDown className='size-3' />,
  [InputType.json]: <Code2 className='size-3' />,
  [InputType.image]: <ImageIcon className='size-3' />,
  [InputType.address]: <MapPin className='size-3' />
}

type InlineHint = { key: string; label: string }

const getValidationHints = (
  def: ConfigDefinition,
  t: (key: string, opts?: Record<string, unknown>) => string
): InlineHint[] =>
  def.validations.flatMap((rule): InlineHint[] => {
    if ('minLength' in rule)
      return [{ key: 'minLength', label: t('configsPage.card.hints.minLength', { n: rule.minLength }) }]
    if ('maxLength' in rule)
      return [{ key: 'maxLength', label: t('configsPage.card.hints.maxLength', { n: rule.maxLength }) }]
    if ('min' in rule) return [{ key: 'min', label: t('configsPage.card.hints.min', { n: rule.min }) }]
    if ('max' in rule) return [{ key: 'max', label: t('configsPage.card.hints.max', { n: rule.max }) }]
    if ('email' in rule) return [{ key: 'email', label: t('configsPage.card.hints.email') }]
    if ('url' in rule) return [{ key: 'url', label: t('configsPage.card.hints.url') }]
    if ('integer' in rule) return [{ key: 'integer', label: t('configsPage.card.hints.integer') }]
    if ('pattern' in rule) return [{ key: 'pattern', label: t('configsPage.card.hints.pattern') }]
    return []
  })

// ─── ConfigFieldRow ───────────────────────────────────────────────────────────

interface ConfigFieldRowProps {
  config: Config
  hidden: boolean
  showFieldLabel: string
  hideFieldLabel: string
  onToggleHidden: () => void
  onEdit: () => void
}

type InlineForm = { value: unknown }

function ConfigFieldRow({
  config,
  hidden,
  showFieldLabel,
  hideFieldLabel,
  onToggleHidden,
  onEdit
}: ConfigFieldRowProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const form = useForm<InlineForm>({ defaultValues: { value: config.value.value } })
  const isDirty = form.formState.isDirty
  const { errors } = form.formState

  const { mutate: saveValue, isPending: isSavingValue } = useMutation({
    mutationFn: (value: unknown) =>
      configService.updateConfig({
        id: config.id,
        body: { key: config.key, value: { ...config.value, value } } as CreateConfigFormValues
      }),
    onSuccess: (_, saved) => {
      toast.success(t('configKeys.toast.updated'))
      form.reset({ value: saved })
    },
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['configs'] })
  })

  const onSave = form.handleSubmit(({ value }) => {
    const validator = buildValueValidator(config.value)
    const result = validator.safeParse(value)
    if (!result.success) {
      form.setError('value', { type: 'manual', message: result.error.issues[0]?.message ?? 'Invalid' })
      return
    }
    saveValue(result.data)
  })

  const colorClass = INPUT_TYPE_COLOR[config.value.inputType] ?? 'text-gray-500 bg-gray-50'
  const icon = INPUT_TYPE_ICON[config.value.inputType]
  const hints = getValidationHints(config.value, t)
  const isBooleanLike = config.value.inputType === InputType.boolean || config.value.inputType === InputType.switch

  const valueInput = (() => {
    switch (config.value.inputType) {
      case InputType.boolean:
      case InputType.switch:
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Switch
                  id={`val-${config.id}`}
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    saveValue(checked)
                  }}
                  disabled={isSavingValue}
                />
                <label
                  htmlFor={`val-${config.id}`}
                  className='cursor-pointer select-none text-sm text-muted-foreground'
                >
                  {field.value ? 'true' : 'false'}
                </label>
                {isSavingValue && <Spinner className='size-3.5' />}
              </div>
            )}
          />
        )
      case InputType.number:
        return (
          <Input
            type='number'
            className='h-8 text-sm'
            {...form.register('value', { valueAsNumber: true })}
            aria-invalid={!!errors.value}
          />
        )
      case InputType.date:
        return <Input type='date' className='h-8 text-sm' {...form.register('value')} aria-invalid={!!errors.value} />
      case InputType.textarea:
        return (
          <Textarea
            rows={2}
            className='resize-none text-sm'
            {...form.register('value')}
            aria-invalid={!!errors.value}
          />
        )
      case InputType.json:
      case InputType.address:
        return (
          <Textarea
            rows={3}
            placeholder='{}'
            className='resize-none font-mono text-xs'
            {...form.register('value')}
            aria-invalid={!!errors.value}
          />
        )
      case InputType.select: {
        const options = config.value.options ?? []
        return (
          <Controller
            name='value'
            control={form.control}
            render={({ field }) => (
              <Select
                value={String(field.value ?? '')}
                onValueChange={(val) => {
                  const matched = options.find((o) => String(o.value) === val)
                  field.onChange(matched?.value ?? val)
                }}
              >
                <SelectTrigger className='h-8 text-sm' aria-invalid={!!errors.value}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )
      }
      default:
        return <Input className='h-8 text-sm' {...form.register('value')} aria-invalid={!!errors.value} />
    }
  })()

  const showHintsRow = config.value.required || hints.length > 0 || !!errors.value

  return (
    <Card className={cn('p-3 rounded-xl gap-0', hidden && 'opacity-50')}>
      {/* Header */}
      <div className='flex items-center gap-2 mb-2'>
        <span className={cn('flex size-5 shrink-0 items-center justify-center rounded text-xs font-bold', colorClass)}>
          {icon}
        </span>
        <span className='flex-1 truncate text-sm font-medium'>{config.value.label}</span>
        {config.value.required && <span className='text-xs font-semibold text-destructive'>*</span>}
        <Button
          variant='ghost'
          size='icon'
          className='size-7'
          title={hidden ? showFieldLabel : hideFieldLabel}
          onClick={onToggleHidden}
        >
          <EyeOff className={cn('size-3.5', hidden ? 'text-muted-foreground/40' : 'text-muted-foreground')} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='size-7'
          title={t('configsPage.card.editDefinition')}
          onClick={onEdit}
        >
          <Pencil className='size-3.5 text-muted-foreground' />
        </Button>
      </div>

      {/* Value input row */}
      <div className='flex items-start gap-2 pl-6'>
        <div className='flex-1 min-w-0'>{valueInput}</div>
        {!isBooleanLike && isDirty && (
          <Button size='sm' className='h-8 shrink-0' disabled={isSavingValue} onClick={onSave}>
            {isSavingValue ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSavingValue ? t('configsPage.card.saving') : t('configsPage.card.save')}
          </Button>
        )}
      </div>

      {/* Hints + error */}
      {showHintsRow && (
        <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-6'>
          {config.value.required && (
            <span className='text-xs text-muted-foreground'>{t('configsPage.card.required')}</span>
          )}
          {hints.map((hint) => (
            <span key={hint.key} className='text-xs text-muted-foreground'>
              {hint.label}
            </span>
          ))}
          {errors.value?.message && <span className='text-xs text-destructive'>{errors.value.message as string}</span>}
        </div>
      )}
    </Card>
  )
}

// ─── ConfigsPage ──────────────────────────────────────────────────────────────

export default function ConfigsPage() {
  const { t } = useTenantTranslation()
  const { configs, isGettingConfigs } = useGetConfigs()
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const [createOpen, setCreateOpen] = useState(false)
  const [createInitialType, setCreateInitialType] = useState<InputType>(InputType.text)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)

  const fieldPalette = useMemo(
    () => [
      {
        label: t('configsPage.palette.singleLineText'),
        inputType: InputType.text,
        icon: <Type className='size-4' />,
        color: 'text-red-500',
        bg: 'bg-red-50'
      },
      {
        label: t('configsPage.palette.multiLineText'),
        inputType: InputType.textarea,
        icon: <AlignLeft className='size-4' />,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      },
      {
        label: t('configsPage.palette.checkbox'),
        inputType: InputType.boolean,
        icon: <CheckCircle2 className='size-4' />,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50'
      },
      {
        label: t('configsPage.palette.dropdown'),
        inputType: InputType.select,
        icon: <ChevronDown className='size-4' />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
      },
      {
        label: t('configsPage.palette.image'),
        inputType: InputType.image,
        icon: <ImageIcon className='size-4' />,
        color: 'text-sky-500',
        bg: 'bg-sky-50'
      },
      {
        label: t('configsPage.palette.toggleButton'),
        inputType: InputType.switch,
        icon: <ToggleLeft className='size-4' />,
        color: 'text-purple-500',
        bg: 'bg-purple-50'
      },
      {
        label: t('configsPage.palette.dateAndTime'),
        inputType: InputType.date,
        icon: <Calendar className='size-4' />,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      },
      {
        label: t('configsPage.palette.address'),
        inputType: InputType.address,
        icon: <MapPin className='size-4' />,
        color: 'text-red-500',
        bg: 'bg-red-50'
      }
    ],
    [t]
  )

  const groups = useMemo(() => {
    if (!configs) return []
    const seen = new Set<string>()
    const result: string[] = []
    for (const config of configs) {
      if (!seen.has(config.value.group)) {
        seen.add(config.value.group)
        result.push(config.value.group)
      }
    }
    return result
  }, [configs])

  const [activeGroup, setActiveGroup] = useState<string>()
  const currentGroup = activeGroup ?? groups[0] ?? ''

  const groupedConfigs = useMemo(() => {
    if (!configs) return {} as Record<string, Config[]>
    return configs.reduce<Record<string, Config[]>>((acc, config) => {
      const g = config.value.group
      if (!acc[g]) acc[g] = []
      acc[g].push(config)
      return acc
    }, {})
  }, [configs])

  const toggleHidden = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openCreate = useCallback((inputType: InputType) => {
    setCreateInitialType(inputType)
    setCreateOpen(true)
  }, [])

  const openEdit = useCallback((config: Config) => {
    setEditingConfig(config)
  }, [])

  const closeEdit = useCallback(() => {
    setEditingConfig(null)
  }, [])

  return (
    <div className='flex h-full min-h-0'>
      <div className='flex min-w-0 flex-1 flex-col gap-4 p-6'>
        <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <span>{t('configsPage.breadcrumb')}</span>
          <ChevronDown className='size-3.5 -rotate-90' />
          <span className='capitalize'>{currentGroup || '—'}</span>
        </nav>

        <div className='flex items-start justify-between'>
          <h1 className='text-2xl font-bold capitalize'>{currentGroup || t('configsPage.fallbackTitle')}</h1>
        </div>

        {isGettingConfigs ? (
          <div className='space-y-2'>
            <div className='flex gap-4 border-b pb-2'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-8 w-28' />
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </div>
        ) : (
          <Tabs value={currentGroup} onValueChange={(v) => setActiveGroup(v)} className='flex flex-col gap-0'>
            <div className='flex items-center border-b'>
              <TabsList className='h-auto gap-0 rounded-none bg-transparent p-0'>
                {groups.map((group) => (
                  <TabsTrigger
                    key={group}
                    value={group}
                    className={cn(
                      'relative h-9 rounded-none border-b-2 border-b-transparent px-4 text-sm font-medium capitalize text-muted-foreground shadow-none transition-none',
                      'data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'
                    )}
                  >
                    {group}
                  </TabsTrigger>
                ))}

                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground ml-2'
                  onClick={() => openCreate(InputType.text)}
                >
                  <Plus className='size-3.5' />
                  {t('configsPage.addSection')}
                </Button>
              </TabsList>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='ml-auto size-8 shrink-0'>
                    <MoreVertical className='size-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>{t('configsPage.cloneSection')}</DropdownMenuItem>
                  <DropdownMenuItem className='text-destructive focus:text-destructive'>
                    {t('configsPage.deleteSection')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {groups.map((group) => (
              <TabsContent key={group} value={group} className='mt-3 space-y-2'>
                {(groupedConfigs[group] ?? []).length === 0 ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>{t('configsPage.emptySection')}</p>
                ) : (
                  (groupedConfigs[group] ?? []).map((config) => (
                    <ConfigFieldRow
                      key={config.id}
                      config={config}
                      hidden={hiddenIds.has(config.id)}
                      showFieldLabel={t('configsPage.showField')}
                      hideFieldLabel={t('configsPage.hideField')}
                      onToggleHidden={() => toggleHidden(config.id)}
                      onEdit={() => openEdit(config)}
                    />
                  ))
                )}
              </TabsContent>
            ))}

            {groups.length === 0 && (
              <div className='py-16 text-center text-sm text-muted-foreground'>{t('configsPage.emptyPage')}</div>
            )}
          </Tabs>
        )}
      </div>

      {/* Right sidebar — field palette */}
      <div className='w-56 shrink-0 border-l p-2'>
        <div className='space-y-2'>
          {fieldPalette.map((item) => (
            <button
              key={item.label}
              type='button'
              className='flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
              onClick={() => openCreate(item.inputType)}
            >
              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', item.bg, item.color)}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <CreateConfigDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialInputType={createInitialType}
        initialGroup={currentGroup}
      />

      <UpdateConfigDialog open={editingConfig !== null} config={editingConfig} onClose={closeEdit} />
    </div>
  )
}
