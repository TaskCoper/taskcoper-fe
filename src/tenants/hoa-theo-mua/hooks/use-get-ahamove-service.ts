import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import ahamoveService from '../services/ahamove.service'

export const useGetAhamoveService = () => {
  const { data: serviceDetail, isLoading: isGettingAhamoveService } = useQuery({
    queryKey: ['ahamove', 'service-details'],
    queryFn: ahamoveService.getService
  })

  const requests = useMemo(
    () => (serviceDetail?.requests ?? []).filter((r) => r.enable).sort((a, b) => a.order - b.order),
    [serviceDetail]
  )

  return { serviceDetail, requests, isGettingAhamoveService }
}
