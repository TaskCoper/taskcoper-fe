import { useCallback, useEffect, useRef } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'

export function useUnsavedPostGuard(dirty: boolean) {
  const { confirm } = useConfirmStore()
  const { t } = useTenantTranslation()
  const showing = useRef(false)
  // Switching channel query parameters must preserve the local draft without a leave dialog.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname
  )
  useBeforeUnload(
    useCallback(
      (event) => {
        if (dirty) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [dirty]
    )
  )
  useEffect(() => {
    if (blocker.state !== 'blocked' || showing.current) return
    showing.current = true
    void confirm({
      title: t('marketingPosts.studio.publish.leaveTitle'),
      description: t('marketingPosts.studio.publish.leaveDescription'),
      confirmText: t('marketingPosts.studio.publish.leave'),
      cancelText: t('marketingPosts.studio.publish.keepEditing')
    })
      .then((leave) => {
        if (leave) blocker.proceed?.()
        else blocker.reset?.()
      })
      .finally(() => {
        showing.current = false
      })
  }, [blocker, confirm, t])
}
