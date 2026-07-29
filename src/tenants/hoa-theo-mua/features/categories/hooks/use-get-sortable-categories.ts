import { useQuery } from '@tanstack/react-query'
import categoryService from '../services'
import type { CategoryProductPage } from '../types'

export const useGetSortableCategories = ({ page }: { page?: CategoryProductPage[] } = {}) => {
  const { data: sortableCategories = [], isLoading: isLoadingSortableCategories } = useQuery({
    queryKey: ['categoryProducts', 'sortable', page],
    queryFn: () => categoryService.getSortableCategories({ page })
  })

  return { sortableCategories, isLoadingSortableCategories }
}
