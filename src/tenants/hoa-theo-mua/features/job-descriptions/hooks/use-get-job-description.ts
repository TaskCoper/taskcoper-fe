import { useQuery } from '@tanstack/react-query'
import jobDescriptionService from '../services'

export const useGetJobDescription = ({ id }: { id?: string }) => {
  const { data: jobDescription, isLoading: isGettingJobDescription } = useQuery({
    queryKey: ['job-description', id],
    queryFn: () => jobDescriptionService.getJobDescription({ id }),
    enabled: !!id
  })

  return { jobDescription, isGettingJobDescription }
}
