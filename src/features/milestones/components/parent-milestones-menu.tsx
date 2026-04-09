import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/utils'
import type { ParentMilestone } from '@/types/milestone.type'
import { CheckIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

interface ParentMilestonesMenuProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ParentMilestone[]
}

export default function ParentMilestonesMenu({ children, open, onOpenChange, items }: ParentMilestonesMenuProps) {
  const navigate = useNavigate()
  const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()

  const handleSelectMilestone = (selectedMilestoneSlug: string) => {
    if (selectedMilestoneSlug === milestoneIdentifier) {
      onOpenChange(false)
      return
    }

    setTimeout(() => {
      navigate(`/projects/${identifier}/milestones/${selectedMilestoneSlug}`)
    }, 500)
  }

  return (
    <DropdownMenu modal open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-64' side='bottom' align='start' sideOffset={8}>
        <DropdownMenuLabel>Tabs</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const isSelected = item.slug === milestoneIdentifier

          return (
            <DropdownMenuItem key={item.id} onClick={() => handleSelectMilestone(item.slug)}>
              <div className='flex justify-between items-center gap-4 w-full'>
                <p className={cn('text-muted-foreground truncate', isSelected && 'font-semibold text-foreground')}>
                  {item.name}
                </p>
                {isSelected && <CheckIcon className='text-primary' />}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
