import { useMemo } from 'react'

export interface ProjectRevenueStats {
  totalIncome: number
  totalExpense: number
  currentBalance: number
  totalTransactions: number
}

interface UseGetProjectRevenueStatsParams {
  projectId?: string
}

export function useGetProjectRevenueStats({ projectId }: UseGetProjectRevenueStatsParams) {
  const projectRevenueStats = useMemo<ProjectRevenueStats>(() => {
    if (!projectId) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        currentBalance: 0,
        totalTransactions: 0
      }
    }

    const totalIncome = 35000000
    const totalExpense = 12000000
    const currentBalance = totalIncome - totalExpense

    return {
      totalIncome,
      totalExpense,
      currentBalance,
      totalTransactions: 18
    }
  }, [projectId])

  return {
    projectRevenueStats,
    isLoadingProjectRevenueStats: false
  }
}
