import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { CalendarDays, CreditCard, Gift, Info, ShoppingBag, Truck, Zap } from 'lucide-react'
import React from 'react'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useToggleConfigActive } from '../hooks/use-toggle-config-active'
import type { ConfigSystemItem } from '../types'

const GROUP_ICONS: Record<string, React.ElementType> = {
  general: Info,
  shipping: Truck,
  payment: CreditCard,
  order: ShoppingBag,
  reward: Gift,
  feature: Zap,
  dateSettings: CalendarDays
}

interface AddConfigSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  configs: ConfigSystemItem[]
}

export default function AddConfigSheet({ open, onOpenChange, configs }: AddConfigSheetProps) {
  const { t } = useTenantTranslation()
  const { mutate: toggleActive, isPending } = useToggleConfigActive()

  const grouped = configs.reduce<Record<string, ConfigSystemItem[]>>((acc, config) => {
    const group = config.value.group
    if (!acc[group]) acc[group] = []
    acc[group].push(config)
    return acc
  }, {})

  const inactiveCount = configs.filter((c) => c.value.isActive === false).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-[440px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]'>
        <SheetHeader className='border-b px-6 py-5'>
          <div className='flex items-center gap-3'>
            <SheetTitle className='flex-1 text-base'>{t('systemConfigs.sheet.title')}</SheetTitle>
            {inactiveCount > 0 && (
              <Badge variant='secondary' className='rounded-full text-xs font-normal'>
                {t('systemConfigs.sheet.hiddenCount', { count: inactiveCount })}
              </Badge>
            )}
          </div>
          <SheetDescription>{t('systemConfigs.sheet.description')}</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          <div className='space-y-5 px-6 py-5'>
            {Object.entries(grouped).map(([group, items]) => {
              const Icon = GROUP_ICONS[group] ?? Info
              const label = t(`systemConfigs.groups.${group}`, { defaultValue: group })

              return (
                <div key={group}>
                  <div className='mb-2.5 flex items-center gap-2'>
                    <div className='bg-muted flex size-5 shrink-0 items-center justify-center rounded-md'>
                      <Icon className='text-muted-foreground size-3' />
                    </div>
                    <span className='text-muted-foreground text-xs font-semibold uppercase tracking-wider'>
                      {label}
                    </span>
                  </div>

                  <div className='rounded-xl border'>
                    {items.map((config, i) => (
                      <React.Fragment key={config.key}>
                        <div className='flex items-start gap-4 px-4 py-3.5'>
                          <div className='min-w-0 flex-1'>
                            <p className='text-sm font-medium leading-snug'>{config.value.label}</p>
                            {config.value.description && (
                              <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed'>
                                {config.value.description}
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={config.value.isActive !== false}
                            disabled={isPending}
                            onCheckedChange={(checked) => toggleActive({ key: config.key, isActive: checked })}
                            className='mt-0.5 shrink-0'
                          />
                        </div>
                        {i < items.length - 1 && <Separator />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
