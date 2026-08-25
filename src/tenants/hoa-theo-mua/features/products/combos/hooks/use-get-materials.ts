import { useQuery } from '@tanstack/react-query'
import productService from '../../services'
import type { MaterialProductLabel } from '../types'

export const useGetMaterials = ({
  search,
  productLabel,
  enabled = true
}: {
  search?: string
  productLabel?: MaterialProductLabel
  enabled?: boolean
} = {}) => {
  const { data: materialsPage, isLoading: isGettingMaterials } = useQuery({
    queryKey: ['materials', search, productLabel],
    queryFn: () => productService.getMaterials({ search, productLabel, page: 1, pageSize: 100 }),
    enabled
  })

  return { materials: materialsPage?.items ?? [], isGettingMaterials }
}
