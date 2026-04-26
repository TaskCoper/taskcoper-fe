import SanitizedHtml from '@/components/sanitized-html'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { useGetProject } from '@/features/projects/hooks/use-get-project'
import { DATE_LOCALES } from '@/shared/constants'
import { cn, getAvatarFallback } from '@/shared/utils'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { BookOpenIcon, CameraIcon, ChevronsRightIcon, ImageOffIcon, MailIcon, PhoneIcon, UsersIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

export default function ProjectInfoPage() {
  const { t, i18n } = useTranslation()
  const { identifier } = useParams<{ identifier: string }>()
  const { me: user } = useGetMe()

  const { project, isLoadingProject } = useGetProject({ identifier })

  const currentLocale = DATE_LOCALES[i18n.language] || enUS
  const dateFormat = i18n.language === 'vi-VN' ? 'd MMM, yyyy' : 'MMM d, yyyy'

  const generalItems = [
    {
      label: t('project.info.teamSize'),
      value: project?.teamSize ?? null,
      icon: UsersIcon
    },
    {
      label: t('project.info.teamContact'),
      value: project?.teamContact ?? null,
      icon: PhoneIcon
    },
    {
      label: t('project.info.teamEmail'),
      value: project?.teamEmail ?? null,
      icon: MailIcon
    },
    ...(user?.organizationId
      ? [
          {
            label: t('project.info.schoolSubject'),
            value: project?.schoolSubject ?? null,
            icon: BookOpenIcon
          }
        ]
      : [])
  ]

  useEffect(() => {
    if (project) {
      document.title = `${project?.name} | TaskCoper`
    }
  }, [project])

  if (isLoadingProject) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10'>
        <Skeleton className='h-24 col-span-1 lg:col-span-12' />
        <Skeleton className='h-60 col-span-1 lg:col-span-8' />
        <Skeleton className='h-28 col-span-1 lg:col-span-4' />
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
      <div className='col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 lg:gap-8'>
        {/* Left column */}
        <div className='col-span-1 lg:col-span-8'>
          <div className='relative h-48 sm:h-52'>
            <div className='size-full group/cover relative'>
              {project?.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={t('project.coverImageAlt', { name: project.name })}
                  className='size-full object-cover rounded-2xl shadow-sm border border-border'
                />
              ) : (
                <div className='size-full rounded-2xl bg-muted flex items-center justify-center'>
                  <ImageOffIcon className='size-10 text-muted-foreground' />
                </div>
              )}

              <Button variant='outline' size='sm' type='button' className={cn('hidden')}>
                <CameraIcon />
                {t('project.addCoverImage')}
              </Button>
            </div>

            <div className='absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 size-28 lg:size-32 z-20 group/logo rounded-2xl bg-muted shadow-sm'>
              {project?.logoImage ? (
                <img
                  src={project.logoImage}
                  alt={t('project.logoImageAlt', { name: project.name })}
                  className='size-full object-cover rounded-xl shadow-sm border border-border'
                />
              ) : (
                <div className='size-full flex items-center justify-center'>
                  <ImageOffIcon className='size-8 text-muted-foreground' />
                </div>
              )}
            </div>
          </div>

          <div className='mt-16 mb-8 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4'>
            <div className='lg:px-6 w-full'>
              <h1 className='text-2xl sm:text-3xl font-semibold wrap-break-word'>{project?.name}</h1>
            </div>

            <div className='w-full'>
              <Card className='w-full text-sm sm:text-base text-left p-0 shadow-none gap-0'>
                <div className='px-3 py-2 flex items-center gap-2 bg-muted/60 rounded-t-xl'>
                  <BookOpenIcon className='size-4 text-muted-foreground' />
                  <p className='text-sm font-semibold text-muted-foreground'>{t('project.info.readme')}</p>
                </div>
                <Separator />
                <div className='p-4'>
                  {project?.description ? (
                    <SanitizedHtml html={project?.description} />
                  ) : (
                    <p className='text-xs text-muted-foreground text-center'>{t('common.ui.noDescription')}</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className='col-span-1 lg:col-span-4 space-y-6'>
          <div className='space-y-2'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1'>
              <div>
                <p className='font-semibold'>
                  {t('project.info.progress')} ({project?.progress ? project.progress : 0}%)
                </p>
                <p className='text-xs text-muted-foreground'>{t('project.info.progressDescription')}</p>
              </div>
            </div>
            <Progress value={project?.progress ?? 0} className='h-2' />
          </div>
          <Separator />
          <div className='space-y-6'>
            <div className='space-y-2'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='font-semibold'>{t('project.info.general')}</p>
                  <p className='text-xs text-muted-foreground'>{t('project.info.generalDescription')}</p>
                </div>
              </div>

              <div className='space-y-4 mt-4'>
                {generalItems.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between hover:bg-muted/40 transition-colors group'
                  >
                    <div className='flex items-center gap-2.5 text-muted-foreground'>
                      <item.icon className='size-4' />
                      <p className='text-xs font-medium'>{item.label}</p>
                    </div>

                    <p className='text-xs font-semibold max-w-[70%] truncate' title={String(item.value)}>
                      {item.value ?? <span className='text-muted-foreground/40'>-</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            <div className='space-y-2'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='font-semibold'>{t('project.info.domains')}</p>
                  <p className='text-xs text-muted-foreground'>{t('project.info.domainDescription')}</p>
                </div>
              </div>

              <div className='flex items-center gap-2 flex-wrap'>
                {(project?.domains ?? []).map((domain) => (
                  <div className='rounded-sm bg-primary text-white px-2 py-1' key={domain.id}>
                    <p className='text-xs font-medium'>{domain.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            <div className='space-y-2'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='font-semibold'>{t('project.info.timeline')}</p>
                  <p className='text-xs text-muted-foreground'>{t('project.info.timelineDescription')}</p>
                </div>
              </div>

              <Card className='p-4 border-dashed shadow-none flex-row items-center justify-between gap-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>{t('project.info.startDate')}</p>
                  <p className='font-bold text-primary'>
                    {project?.startDate
                      ? format(new Date(project.startDate), dateFormat, { locale: currentLocale })
                      : 'N/A'}
                  </p>
                </div>

                <ChevronsRightIcon className='size-5 text-muted-foreground' />

                <div>
                  <p className='text-xs text-muted-foreground'>{t('project.info.endDate')}</p>
                  <p className='font-bold text-primary'>
                    {project?.endDate
                      ? format(new Date(project.endDate), dateFormat, { locale: currentLocale })
                      : 'N/A'}
                  </p>
                </div>
              </Card>
            </div>

            <Separator />
            <div className='space-y-2'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <p className='font-semibold'>
                    {t('project.info.members')} ({project?.members?.length ?? 0})
                  </p>
                  <p className='text-xs text-muted-foreground'>{t('project.info.memberDescription')}</p>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='space-y-3 p-2'>
                  {(project?.members ?? []).map((member) => (
                    <div
                      key={member.userId}
                      className='flex items-center gap-3 rounded-md hover:bg-muted/50 transition-colors'
                    >
                      <Avatar className='ring-2 ring-slate-500 ring-offset-2'>
                        <AvatarImage src={member.avatar ?? ''} />
                        <AvatarFallback>{getAvatarFallback(member.fullName)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className='flex items-center gap-1'>
                          <p className='text-sm font-medium truncate'>{member.fullName}</p>

                          <p className='text-xs text-muted-foreground'>
                            {member.roles.map((role) => role.name).join(', ')}
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground truncate'>{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
