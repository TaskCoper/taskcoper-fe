export const taskDependencyKeys = {
  all: ['task-dependencies'] as const,
  detail: (taskId?: string) => ['task-dependencies', taskId] as const,
  candidates: (taskId: string, search: string) => ['task-dependencies', taskId, 'candidates', search] as const
}
