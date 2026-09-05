import { keepPreviousData, useQuery } from '@tanstack/react-query'
import productService from '../../services'
import type { MaterialProductLabel } from '../types'

export const useGetMaterials = ({
  search,
  productLabel,
  excludeIds,
  pageIndex,
  pageSize,
  enabled = true
}: {
  search?: string
  productLabel?: MaterialProductLabel
  excludeIds?: string[]
  pageIndex?: number
  pageSize?: number
  enabled?: boolean
} = {}) => {
  const { data: materialsPage, isFetching: isGettingMaterials } = useQuery({
    queryKey: ['materials', search, productLabel, excludeIds, pageIndex, pageSize],
    queryFn: () => productService.getMaterials({ search, productLabel, excludeIds, pageIndex, pageSize }),
    enabled,
    placeholderData: keepPreviousData
  })

  return { materialsPage, materials: materialsPage?.items ?? [], isGettingMaterials }
}
