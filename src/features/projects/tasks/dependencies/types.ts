export interface DependencyTask {
  taskId: string
  name: string
  slug: string
  isCompleted: boolean
  projectId: string
  parentMilestoneId: string
  parentMilestoneSlug: string
}

export interface TaskDependencies {
  isBlocked: boolean
  dependsOn: DependencyTask[]
  blocks: DependencyTask[]
}
