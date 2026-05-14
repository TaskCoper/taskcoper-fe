import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import type { ProjectMember } from '../../core/types'
import { useGetProjectMembers } from './use-get-project-members'

interface UseOwnerTransferCandidatesParams {
  projectIdentifier?: string
  currentUserId?: string
  enabled?: boolean
}

export const useOwnerTransferCandidates = ({
  projectIdentifier,
  currentUserId,
  enabled = true
}: UseOwnerTransferCandidatesParams) => {
  const queryClient = useQueryClient()

  const [selectedNewOwnerUserId, setSelectedNewOwnerUserId] = useState('')
  const [ownerCandidatesSearchTerm, setOwnerCandidatesSearchTerm] = useState('')
  const [ownerCandidatesPageIndex, setOwnerCandidatesPageIndex] = useState(DEFAULT_PAGE_INDEX)

  const excludedUserIds = useMemo(() => (currentUserId ? [currentUserId] : undefined), [currentUserId])

  const { members: ownerCandidates, isLoadingMembers: isLoadingOwnerCandidates } = useGetProjectMembers({
    identifier: projectIdentifier,
    searchTerm: ownerCandidatesSearchTerm || undefined,
    pageIndex: ownerCandidatesPageIndex,
    pageSize: DEFAULT_PAGE_SIZE,
    enabled,
    excludeIds: excludedUserIds
  })

  const ownerCandidateOptions = useMemo(() => {
    const optionsMap = new Map<string, string>()

    for (let pageIndex = DEFAULT_PAGE_INDEX; pageIndex <= ownerCandidatesPageIndex; pageIndex += 1) {
      const cachedMembers = queryClient.getQueryData<BasePaginationResponse<ProjectMember>>(
        queryKeys.projects.members.list({
          identifier: projectIdentifier,
          searchTerm: ownerCandidatesSearchTerm || undefined,
          pageIndex,
          pageSize: DEFAULT_PAGE_SIZE,
          excludeIds: excludedUserIds
        })
      )

      const pageItems =
        pageIndex === ownerCandidatesPageIndex ? ownerCandidates.value.items : (cachedMembers?.value.items ?? [])

      pageItems.forEach((member) => {
        optionsMap.set(member.userId, `${member.fullName} (${member.email})`)
      })
    }

    return Array.from(optionsMap.entries()).map(([value, label]) => ({ value, label }))
  }, [
    excludedUserIds,
    ownerCandidates.value.items,
    ownerCandidatesPageIndex,
    ownerCandidatesSearchTerm,
    projectIdentifier,
    queryClient
  ])

  const handleOwnerCandidateSearch = useCallback((searchTerm: string) => {
    setOwnerCandidatesSearchTerm(searchTerm)
    setOwnerCandidatesPageIndex(DEFAULT_PAGE_INDEX)
  }, [])

  const fetchNextOwnerCandidates = useCallback(() => {
    if (!ownerCandidates.value.hasNextPage || isLoadingOwnerCandidates) return

    setOwnerCandidatesPageIndex((prevPageIndex) => prevPageIndex + 1)
  }, [ownerCandidates.value.hasNextPage, isLoadingOwnerCandidates])

  const resetOwnerTransferState = useCallback(() => {
    setSelectedNewOwnerUserId('')
    setOwnerCandidatesSearchTerm('')
    setOwnerCandidatesPageIndex(DEFAULT_PAGE_INDEX)
  }, [])

  return {
    selectedNewOwnerUserId,
    setSelectedNewOwnerUserId,
    ownerCandidateOptions,
    isLoadingOwnerCandidates,
    hasNextOwnerCandidatesPage: ownerCandidates.value.hasNextPage,
    isFetchingNextOwnerCandidates: isLoadingOwnerCandidates && ownerCandidatesPageIndex > DEFAULT_PAGE_INDEX,
    handleOwnerCandidateSearch,
    fetchNextOwnerCandidates,
    resetOwnerTransferState
  }
}
