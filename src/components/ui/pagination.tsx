import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/shared/utils'

export function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return <nav role='navigation' className={cn('mx-auto flex w-full justify-center', className)} {...props} />
}

export function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} {...props} />
}

export function PaginationItem({ ...props }: ComponentProps<'li'>) {
  return <li {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ComponentProps<typeof Button>, 'size'> &
  ComponentProps<'a'>

export function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }), className)}
      {...props}
    />
  )
}

export function PaginationPrevious({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink size='default' className={cn('gap-1 pl-2.5', className)} {...props}>
      <ChevronLeft className='size-4' aria-hidden='true' />
    </PaginationLink>
  )
}

export function PaginationNext({ className, ...props }: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink size='default' className={cn('gap-1 pr-2.5', className)} {...props}>
      <ChevronRight className='size-4' aria-hidden='true' />
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span aria-hidden className={cn('flex size-9 items-center justify-center', className)} {...props}>
      <MoreHorizontal className='size-4' aria-hidden='true' />
    </span>
  )
}
