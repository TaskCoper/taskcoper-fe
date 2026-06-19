import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, ChevronDownIcon, CreditCard, Gift, Info, Settings2, ShoppingBag, Truck, Zap } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AddConfigSheet } from '../features/config-admin-system/components/add-config-sheet'
import { ConfigItem } from '../features/config-admin-system/components/get-config-admin'
import { useGetSystemConfigs } from '../features/config-admin-system/hooks/use-get-system-configs'
import type { ConfigSystemItem } from '../features/config-admin-system/service'

const GROUP_META: Record<string, { label: string; icon: React.ElementType }> = {
  general: { label: 'Thông tin chung', icon: Info },
  shipping: { label: 'Vận chuyển', icon: Truck },
  payment: { label: 'Thanh toán', icon: CreditCard },
  order: { label: 'Đơn hàng', icon: ShoppingBag },
  reward: { label: 'Tích điểm', icon: Gift },
  feature: { label: 'Cấu hình tính năng', icon: Zap },
  dateSettings: { label: 'Cấu hình thời gian', icon: CalendarDays }
}

export default function SystemConfigsPage() {
  const { systemConfigs, isLoadingSystemConfigs } = useGetSystemConfigs()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [sheetOpen, setSheetOpen] = useState(false)

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

  const handleSave = (e: React.FormEvent<HTMLFormElement>, group: string) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    console.log(`[${group}] save:`, data)
    toast.success('Lưu thành công', { description: GROUP_META[group]?.label ?? group })
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='mx-auto max-w-3xl p-6'>
        <div className='mb-7 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl font-semibold'>Cấu hình hệ thống</h1>
            <p className='text-muted-foreground mt-1 text-sm'>Quản lý các cài đặt vận hành của hệ thống</p>
          </div>
          <Button variant='outline' size='sm' className='shrink-0 gap-1.5' onClick={() => setSheetOpen(true)}>
            <Settings2 className='size-4' />
            Quản lý cấu hình
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
              const { label, icon: Icon } = GROUP_META[group] ?? { label: group, icon: Info }
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
                          <Button type='submit' size='sm' className='ml-auto'>
                            Lưu thay đổi
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
