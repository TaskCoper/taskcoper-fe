import { Card } from '@/components/ui/card'
import { ImageOffIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { ProjectPreview } from '../types'

interface ProjectPreviewCardProps {
  project: ProjectPreview
}

export default function ProjectPreviewCard({ project }: ProjectPreviewCardProps) {
  return (
    <Link to={`/projects/${project.slug}`} className='hover:underline'>
      <Card className='gap-0 p-px w-full h-full border-none'>
        <div className='w-full h-4/6'>
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.name} className='w-full h-full object-cover rounded-t-[12px]' />
          ) : (
            <div className='w-full h-full bg-muted rounded-t-xl flex items-center justify-center'>
              <ImageOffIcon className='text-muted-foreground/60 size-6' />
            </div>
          )}
        </div>
        <div className='h-2/6 flex flex-col items-start justify-center px-2 w-full'>
          <p className='text-sm font-medium truncate w-full'>{project.name}</p>
        </div>
      </Card>
    </Link>
  )
}
