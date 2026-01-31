import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getAvatarFallback } from '@/shared/utils'
import type { ProjectResource } from '@/types/project.type'
import { format, isToday, isYesterday } from 'date-fns'
import { DownloadIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import FileIcon from './file-icon'

interface StorageTimelineProps {
  resources: ProjectResource[]
}

export default function StorageTimeline({ resources }: StorageTimelineProps) {
  const { t } = useTranslation()

  const sortedResources = [...resources].sort(
    (a, b) => new Date(b.createdOnUtc).getTime() - new Date(a.createdOnUtc).getTime()
  )

  const groupedResources = sortedResources.reduce<Record<string, ProjectResource[]>>((groups, resource) => {
    const date = new Date(resource.createdOnUtc)
    const dateKey = format(date, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(resource)
    return groups
  }, {})

  const dateKeys = Object.keys(groupedResources).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className='relative space-y-8 p-4 pl-6'>
      <div className='absolute left-[33px] top-4 bottom-4 w-px bg-border' />

      {dateKeys.map((dateKey) => {
        const date = new Date(dateKey)
        let title = format(date, 'MMMM d, yyyy')

        if (isToday(date)) {
          title = t('project.sidebar.storagePage.today')
        } else if (isYesterday(date)) {
          title = t('project.sidebar.storagePage.yesterday')
        }

        return (
          <div key={dateKey} className='relative'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='size-2.5 rounded-full bg-primary ring-4 ring-background relative z-10 ml-[4.5px]' />
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>{title}</h3>
            </div>

            <div className='space-y-3 ml-8'>
              {groupedResources[dateKey].map((resource) => (
                <Card key={resource.id} className='group p-2 gap-2 flex-row items-center rounded-md'>
                  <div className='flex size-10 shrink-0 items-center justify-center rounded-sm bg-muted'>
                    {resource.thumbnailUrl ? (
                      <img
                        src={resource.thumbnailUrl}
                        alt={resource.name}
                        className='size-full rounded-md object-cover'
                      />
                    ) : (
                      <FileIcon mimeType={resource.mimeType} className='size-5 text-muted-foreground' />
                    )}
                  </div>

                  <div className='flex-1 min-w-0 space-y-1'>
                    <div className='flex items-center justify-between gap-2'>
                      <a
                        href={resource.url}
                        target='_blank'
                        rel='noreferrer'
                        className='font-medium text-sm hover:underline truncate'
                      >
                        {resource.name}
                      </a>
                      <span className='text-xs text-muted-foreground shrink-0'>
                        {format(new Date(resource.createdOnUtc), 'h:mm a')}
                      </span>
                    </div>

                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1.5'>
                          <Avatar className='size-4'>
                            <AvatarImage src={resource.uploadBy.avatar || undefined} />
                            <AvatarFallback className='text-[8px]'>
                              {getAvatarFallback(`${resource.uploadBy.firstName} ${resource.uploadBy.lastName}`)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {resource.uploadBy.firstName} {resource.uploadBy.lastName}
                          </span>
                        </div>
                        <div className='w-px h-3 bg-muted-foreground/80 shrink-0' />
                        {resource.task && (
                          <>
                            <span className='truncate max-w-72'>
                              {t('project.sidebar.storagePage.task')}:{' '}
                              <span className='font-medium text-foreground'>{resource.task.name}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Hover Actions */}
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              href={resource.url}
                              download
                              target='_blank'
                              rel='noreferrer'
                              className='text-muted-foreground hover:text-primary transition-colors'
                            >
                              <DownloadIcon className='size-3.5' />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>{t('project.sidebar.storagePage.download')}</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
