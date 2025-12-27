import type { Milestone } from './milestone.type'
import type { Task } from './task.type'

export interface ProjectPreview {
  projectId: string
  projectName: string
  description: string
  projectStartDate: string
  projectEndDate: string
  coverImage: string | null
  projectTeamSize: number | null
  projectSchoolSubject: string | null
}

export interface MilestoneWithTasks {
  parentId: string
  milestones: Milestone[]
  tasks: Task[]
}
