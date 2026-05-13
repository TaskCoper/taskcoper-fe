import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function NewsArticleCardSkeleton() {
  return (
    <Card className='col-span-12 flex h-full flex-col gap-0 overflow-hidden rounded-xl border-border/65 bg-card/95 p-0 py-0 shadow-none sm:col-span-6 lg:col-span-4'>
      <Skeleton className='aspect-[4/3] w-full rounded-none lg:aspect-square' />
      <div className='flex flex-1 flex-col gap-2.5 p-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-6 rounded-full' />
          <Skeleton className='h-3 w-24' />
        </div>
        <Skeleton className='h-4 w-11/12' />
        <Skeleton className='h-4 w-9/12' />
        <Skeleton className='h-3 w-full' />
        <Skeleton className='mt-auto h-3 w-1/3 pt-1' />
      </div>
    </Card>
  )
}
