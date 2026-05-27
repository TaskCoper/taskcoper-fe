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
          'overflow-x-auto flex items-start gap-3 p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-black/80'
      })}
    >
      {children}
    </div>
  )
}
