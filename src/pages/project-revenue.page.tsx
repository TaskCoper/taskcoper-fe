import ProjectRevenueTable from '@/features/projects/components/project-revenue-table'
import { useParams } from 'react-router'

export default function ProjectRevenuePage() {
  const { projectId } = useParams<{ projectId: string }>()

  return <div className='p-4'>{projectId ? <ProjectRevenueTable projectId={projectId} /> : null}</div>
}
