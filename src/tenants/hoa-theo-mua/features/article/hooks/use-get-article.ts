import { useQuery } from '@tanstack/react-query'
import articleService from '../services'

export const useGetArticle = (identifier?: string) => {
  const {
    data: articleResponse,
    isError,
    error,
    isFetching,
    isLoading: isLoadingArticle
  } = useQuery({
    queryKey: ['article', identifier],
    queryFn: () => articleService.getArticle({ identifier }),
    enabled: !!identifier
  })

  return {
    article: articleResponse?.value,
    error,
    isError,
    isFetching,
    isLoadingArticle
  }
}
