import ProjectBoard from '@/features/projects/components/project-board'
import { Outlet } from 'react-router'

export default function ProjectTasksPage() {
  return (
    <>
      <div className='w-full h-full'>
        <ProjectBoard />
      </div>

      <Outlet />
    </>
  )
}
