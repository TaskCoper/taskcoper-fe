import { useQuery } from '@tanstack/react-query'
import newsCategoryService from '../service'

export const useGetCategory = (id?: string) => {
  const {
    data: categoryResponse,
    error,
    isError,
    isFetching,
    isLoading: isLoadingCategory
  } = useQuery({
    queryKey: ['categoryNews', id],
    queryFn: () => newsCategoryService.getNewsCategory({ id }),
    enabled: !!id
  })

  return {
    category: categoryResponse?.value,
    error,
    isError,
    isFetching,
    isLoadingCategory
  }
}
