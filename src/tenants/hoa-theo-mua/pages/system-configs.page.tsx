import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, ChevronDownIcon, CreditCard, Gift, Info, Settings2, ShoppingBag, Truck, Zap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import AddConfigSheet from '../features/configs/components/add-config-sheet'
import ConfigItem from '../features/configs/components/get-config-admin'
import { useGetSystemConfigs } from '../features/configs/hooks/use-get-system-configs'
import { useUpdateConfig } from '../features/configs/hooks/use-update-config'
import type { ConfigSystemItem } from '../features/configs/types'

function extractConfigValue(config: ConfigSystemItem, formData: FormData): unknown {
  const { inputType } = config.value
  const key = config.key

  switch (inputType) {
    case 'text':
    case 'date':
      return formData.get(key) as string

    case 'number':
    case 'currency':
    case 'percentage': {
      const raw = formData.get(key) as string | null
      return raw !== null ? Number(raw) : null
    }

    case 'select': {
      const raw = formData.get(key) as string | null
      if (raw === null) return null
      const num = Number(raw)
      return Number.isNaN(num) ? raw : num
    }

    case 'address':
      return {
        city: formData.get(`${key}.city`),
        ward: formData.get(`${key}.ward`),
        street: formData.get(`${key}.street`)
      }

    case 'dateRange':
      return {
        from: formData.get(`${key}.from`),
        to: formData.get(`${key}.to`)
      }

    case 'checkbox':
      return formData.getAll(key)

    case 'switch-group': {
      type SwitchItem = { key: string; label: string; description?: string; value: boolean }
      return ((config.value.items as SwitchItem[]) ?? []).map((item) => ({
        ...item,
        value: formData.get(`${key}.${item.key}`) === 'true'
      }))
    }

    default:
      return formData.get(key)
  }
}

const GROUP_ICONS: Record<string, React.ElementType> = {
  general: Info,
  shipping: Truck,
  payment: CreditCard,
  order: ShoppingBag,
  reward: Gift,
  feature: Zap,
  dateSettings: CalendarDays
}

export default function SystemConfigsPage() {
  const { t } = useTranslation()
  const { systemConfigs, isLoadingSystemConfigs } = useGetSystemConfigs()
  const { mutateAsync: updateConfig } = useUpdateConfig()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [sheetOpen, setSheetOpen] = useState(false)
  const [savingGroup, setSavingGroup] = useState<string | null>(null)

  const allItems = systemConfigs.value.items
  const activeItems = allItems.filter((config) => config.value.isActive !== false)
  const inactiveCount = allItems.length - activeItems.length

  const grouped = activeItems.reduce<Record<string, ConfigSystemItem[]>>((acc, config) => {
    const group = config.value.group
    if (!acc[group]) acc[group] = []
    acc[group].push(config)
    return acc
  }, {})

  const toggle = (group: string) => setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  const isOpen = (group: string, index: number) => openGroups[group] ?? index === 0

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, group: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const items = grouped[group] ?? []

    setSavingGroup(group)
    try {
      await Promise.all(
        items.map((config) => updateConfig({ key: config.key, value: extractConfigValue(config, formData) }))
      )
      toast.success(t('systemConfigs.saveSuccess'), {
        description: t(`systemConfigs.groups.${group}`, { defaultValue: group })
      })
    } catch {
      toast.error(t('systemConfigs.saveError'))
    } finally {
      setSavingGroup(null)
    }
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='mx-auto max-w-3xl p-6'>
        <div className='mb-7 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl font-semibold'>{t('systemConfigs.title')}</h1>
            <p className='text-muted-foreground mt-1 text-sm'>{t('systemConfigs.subtitle')}</p>
          </div>
          <Button variant='outline' size='sm' className='shrink-0 gap-1.5' onClick={() => setSheetOpen(true)}>
            <Settings2 className='size-4' />
            {t('systemConfigs.manageButton')}
            {inactiveCount > 0 && (
              <Badge variant='secondary' className='rounded-full px-1.5 py-0 text-xs font-normal tabular-nums'>
                {inactiveCount}
              </Badge>
            )}
          </Button>
        </div>

        {isLoadingSystemConfigs ? (
          <div className='space-y-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-14 w-full rounded-xl' />
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {Object.entries(grouped).map(([group, items], index) => {
              const Icon = GROUP_ICONS[group] ?? Info
              const label = t(`systemConfigs.groups.${group}`, { defaultValue: group })
              const open = isOpen(group, index)

              return (
                <Collapsible key={group} open={open} onOpenChange={() => toggle(group)}>
                  <Card className='overflow-hidden py-0 shadow-sm'>
                    <CollapsibleTrigger asChild>
                      <CardHeader className='cursor-pointer select-none px-5 py-4 transition-colors hover:bg-muted/40'>
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg'>
                            <Icon className='text-muted-foreground size-4' />
                          </div>
                          <span className='flex-1 text-sm font-semibold'>{label}</span>
                          <Badge
                            variant='secondary'
                            className='rounded-full px-2 py-0 text-xs font-normal tabular-nums'
                          >
                            {items.length}
                          </Badge>
                          <ChevronDownIcon
                            className='text-muted-foreground size-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180'
                            data-state={open ? 'open' : 'closed'}
                          />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent className='overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up'>
                      <form onSubmit={(e) => handleSave(e, group)}>
                        <CardContent className='px-5 pt-1 pb-2'>
                          {items.map((config) => (
                            <ConfigItem key={config.key} config={config} />
                          ))}
                        </CardContent>
                        <CardFooter className='border-t px-5 py-3'>
                          <Button type='submit' size='sm' className='ml-auto' disabled={savingGroup === group}>
                            {savingGroup === group ? t('systemConfigs.saving') : t('systemConfigs.saveChanges')}
                          </Button>
                        </CardFooter>
                      </form>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
          </div>
        )}
      </div>

      <AddConfigSheet open={sheetOpen} onOpenChange={setSheetOpen} configs={allItems} />
    </div>
  )
}
