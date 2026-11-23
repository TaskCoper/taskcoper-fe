import { taskDependencyKeys } from './query-keys'
import { invalidateTaskTree } from '@/lib/invalidations'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { taskDependencyService } from './services'

export function useTaskDependencies(taskId?: string) {
  return useQuery({
    queryKey: taskDependencyKeys.detail(taskId),
    queryFn: ({ signal }) => taskDependencyService.get(taskId!, signal),
    enabled: !!taskId,
    throwOnError: false,
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  })
}

export function useDependencyCandidates(taskId: string, search: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: taskDependencyKeys.candidates(taskId, search),
    queryFn: ({ pageParam, signal }) => taskDependencyService.candidates(taskId, search, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageIndex + 1 : undefined),
    enabled,
    throwOnError: false,
    staleTime: 0
  })
}

export function useUpdateTaskDependency(projectIdentifier: string, parentMilestoneIdentifier: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: taskDependencyService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskDependencyKeys.all })
      invalidateTaskTree(queryClient, { projectIdentifier, parentMilestoneIdentifier })
    },
    onError: (error) => {
      toast.error(t('task.dependency.updateError'), { description: error.response?.data?.detail })
    }
  })
}
