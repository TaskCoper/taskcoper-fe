import { useDndContext } from '@dnd-kit/core'
import { cva } from 'class-variance-authority'

interface ProjectContainerProps {
  children: React.ReactNode
}

export default function ProjectContainer({ children }: ProjectContainerProps) {
  const dndContext = useDndContext()

  const variations = cva('h-full w-full', {
    variants: {
      dragging: {
        default: 'snap-x snap-mandatory',
        active: 'snap-none'
      }
    }
  })

  return (
    <div
      className={variations({
        dragging: dndContext.active ? 'active' : 'default',
        className:
          'overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent scrollbar-corner-slate-50 p-4 flex'
      })}
    >
      {children}
    </div>
  )
}
