import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import type { User } from '@/types/user.type'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

const getDeviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export const useSyncTimezone = (me?: User) => {
  const queryClient = useQueryClient()
  const meRef = useRef(me)
  const isSyncingRef = useRef(false)
  const lastSyncedTimezoneRef = useRef<string | null>(null)

  meRef.current = me

  useEffect(() => {
    lastSyncedTimezoneRef.current = null
  }, [me?.id])

  useEffect(() => {
    if (!me) return

    const syncTimezone = async () => {
      if (isSyncingRef.current) return

      const deviceTimezone = getDeviceTimezone()

      if (me.timeZone === deviceTimezone || lastSyncedTimezoneRef.current === deviceTimezone) return

      isSyncingRef.current = true

      try {
        await userService.updateMyTimezone(meRef.current!, deviceTimezone)
        lastSyncedTimezoneRef.current = deviceTimezone
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      } catch (error) {
        console.error('Failed to sync timezone:', error)
      } finally {
        isSyncingRef.current = false
      }
    }

    syncTimezone()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(syncTimezone, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [me, queryClient])
}
