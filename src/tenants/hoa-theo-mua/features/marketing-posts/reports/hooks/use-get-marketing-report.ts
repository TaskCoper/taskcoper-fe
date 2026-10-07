import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { marketingPostKeys } from '../../query-keys'
import { getMockMarketingReport } from '../mock-reports'
import type { GetMarketingReportParams } from '../types'

export const useGetMarketingReport = ({ range, channel }: GetMarketingReportParams) => {
  const params = { range, channel }
  const { data: marketingReport, isLoading: isGettingMarketingReport } = useQuery({
    queryKey: marketingPostKeys.report(params),
    queryFn: () => getMockMarketingReport(params),
    placeholderData: keepPreviousData
  })

  return { marketingReport, isGettingMarketingReport }
}
