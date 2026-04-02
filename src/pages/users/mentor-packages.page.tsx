import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import CreateMentorPackageDialog from '@/features/mentor-packages/components/create-mentor-package-dialog'
import { useGetMyMentorPackages } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages'
import { useUpdateMentorPackage } from '@/features/mentor-packages/hooks/use-update-mentor-package'
import { formatCurrency } from '@/shared/utils'
import type { MentorPackage } from '@/types/mentor-package.type'
import { ArrowDownIcon, ArrowUpIcon, CheckCircle2Icon, CircleIcon, ClockIcon, PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const ActiveFlag = ({ isActive }: { isActive: MentorPackage['isActive'] }) => {
  const { t } = useTranslation()
  const Icon = isActive ? CheckCircle2Icon : CircleIcon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${
        isActive
          ? 'bg-green-500/10 text-green-600 border-green-500/20'
          : 'bg-muted/40 text-muted-foreground border-border'
      }`}
    >
      <Icon className='size-3' />
      {isActive ? t('common.status.active') : t('common.status.inactive')}
    </span>
  )
}

export default function MentorPackagesPage() {
  const { t } = useTranslation()
  const { mentorPackages, isLoadingMyMentorPackages } = useGetMyMentorPackages()
  const items = mentorPackages.value.items as MentorPackage[]
  const { updateMentorPackage, isUpdatingMentorPackage } = useUpdateMentorPackage()

  const changeSortOrder = (pkg: MentorPackage, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? -1 : 1
    const nextSortOrder = pkg.sortOrder + delta
    if (nextSortOrder < 0) return

    updateMentorPackage({
      body: {
        mentorPackageId: pkg.id,
        name: pkg.name,
        description: pkg.description,
        durationInMinutes: pkg.durationInMinutes,
        totalSessions: String(pkg.totalSessions),
        price: String(pkg.price),
        currency: pkg.currency,
        isActive: pkg.isActive,
        sortOrder: nextSortOrder
      }
    })
  }

  return (
    <div className='absolute inset-0 overflow-y-auto'>
      <div className='mx-auto max-w-4xl space-y-10 p-4 pb-20'>
        <div>
          <p className='text-2xl font-bold'>{t('mentorPackage.page.title')}</p>
          <p className='text-muted-foreground text-sm'>{t('mentorPackage.page.description')}</p>
        </div>

        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <div className='flex-1' />

            <CreateMentorPackageDialog>
              <Button size='sm'>
                <PlusIcon />
                {t('mentorPackage.list.newPackage')}
              </Button>
            </CreateMentorPackageDialog>
          </div>

          <div className='space-y-3'>
            {isLoadingMyMentorPackages ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className='overflow-hidden p-0 gap-0 rounded-lg'>
                  <div className='flex items-center gap-3 p-3'>
                    <Skeleton className='size-8 rounded-full shrink-0' />
                    <div className='flex-1 min-w-0 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                    <div className='flex flex-col items-end gap-2 shrink-0'>
                      <Skeleton className='h-6 w-20 rounded-full' />
                      <Skeleton className='h-4 w-24' />
                    </div>
                  </div>
                </Card>
              ))
            ) : items.length === 0 ? (
              <div className='p-6 text-center space-y-2 mt-10'>
                <div className='flex justify-center'>
                  <ClockIcon className='size-6 text-muted-foreground' />
                </div>
                <div>
                  <p className='font-medium'>{t('mentorPackage.page.emptyTitle')}</p>
                  <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                    {t('mentorPackage.page.emptyDescription')}
                  </p>
                </div>
              </div>
            ) : (
              items.map((mentorPackage, index) => (
                <div key={mentorPackage.id} className='flex items-stretch gap-3'>
                  <div className='flex-1 min-w-0'>
                    <Link to={`${mentorPackage.id}`}>
                      <Card className='overflow-hidden p-0 gap-0 rounded-lg cursor-pointer'>
                        <div className='flex items-start gap-3 p-3'>
                          <div className='size-8 bg-primary/10 rounded-full flex justify-center items-center shrink-0'>
                            <p className='text-primary font-bold font-mono'>{index + 1}</p>
                          </div>

                          <div className='flex-1 min-w-0 space-y-1.5'>
                            <p className='text-sm font-medium truncate'>{mentorPackage.name}</p>
                            <p className='text-xs text-muted-foreground line-clamp-2'>{mentorPackage.description}</p>

                            <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                              <span>
                                {t('mentorPackage.card.sessionsAndDuration', {
                                  sessions: mentorPackage.totalSessions,
                                  minutes: mentorPackage.durationInMinutes
                                })}
                              </span>
                              <span className='font-medium text-foreground'>
                                {formatCurrency(mentorPackage.price, mentorPackage.currency)}
                              </span>
                            </div>
                          </div>

                          <div className='flex flex-col items-end gap-1 shrink-0'>
                            <ActiveFlag isActive={mentorPackage.isActive} />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>

                  <div className='flex flex-col items-center justify-center gap-1 shrink-0'>
                    <Button
                      type='button'
                      size='icon'
                      variant='ghost'
                      disabled={isUpdatingMentorPackage || mentorPackage.sortOrder <= 0 || index === 0}
                      onClick={() => changeSortOrder(mentorPackage, 'up')}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      type='button'
                      size='icon'
                      variant='ghost'
                      disabled={isUpdatingMentorPackage || index === items.length - 1}
                      onClick={() => changeSortOrder(mentorPackage, 'down')}
                    >
                      <ArrowDownIcon />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
