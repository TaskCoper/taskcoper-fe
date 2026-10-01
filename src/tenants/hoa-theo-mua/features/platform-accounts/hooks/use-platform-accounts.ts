import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getApiErrorDetail } from '../../marketing-posts/api-error'
import type { MarketingPostPlatform } from '../../marketing-posts/types'
import { platformAccountKeys } from '../query-keys'
import platformAccountService from '../services'
import { PlatformAccountStatus, type PlatformAccount, type PlatformAccountSession } from '../types'

// Callback chưa redirect về frontend cũng chưa postMessage, nên chỉ biết xong bằng cách
// canh cửa sổ đóng lại rồi đọc lại danh sách.
const POPUP_POLL_MS = 800
const POPUP_FEATURES = 'width=620,height=760,menubar=no,toolbar=no'

// Backend liệt kê sẵn messageCode nên dịch thẳng, khỏi hiện câu tiếng Anh của provider
const errorMessageKeys: Record<string, string> = {
  PLATFORM_OAUTH_STATE_INVALID: 'stateInvalid',
  PLATFORM_OAUTH_DENIED: 'denied',
  PLATFORM_REAUTH_REQUIRED: 'reauthRequired',
  PLATFORM_NO_ELIGIBLE_ACCOUNT: 'noEligibleAccount',
  PLATFORM_ACCOUNT_MISMATCH: 'accountMismatch',
  PLATFORM_ACCOUNT_NOT_FOUND: 'notFound',
  PLATFORM_ACCOUNT_CHANGED: 'accountChanged',
  PLATFORM_ACCOUNT_DISABLED: 'accountDisabled',
  PLATFORM_REFRESH_IN_PROGRESS: 'refreshInProgress',
  PLATFORM_ACCOUNT_IN_USE: 'accountInUse',
  PLATFORM_RATE_LIMITED: 'rateLimited',
  PLATFORM_PROVIDER_UNAVAILABLE: 'providerUnavailable',
  PLATFORM_INVALID_RESPONSE: 'providerUnavailable',
  PLATFORM_PROVIDER_TIMEOUT: 'providerTimeout',
  PLATFORM_NOT_CONFIGURED: 'notConfigured',
  PLATFORM_ENCRYPTION_NOT_CONFIGURED: 'notConfigured',
  PLATFORM_TOKEN_UNAVAILABLE: 'notConfigured'
}

export const usePlatformAccounts = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const popupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: accounts = [], isLoading: isGettingAccounts } = useQuery({
    queryKey: platformAccountKeys.list(),
    queryFn: () => platformAccountService.getPlatformAccounts(),
    // Lỗi cấu hình môi trường là chuyện của server, đừng đẩy cả trang sang màn hình lỗi
    throwOnError: false
  })

  const refreshList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: platformAccountKeys.all }),
    [queryClient]
  )

  const onError = useCallback(
    (error: Parameters<typeof getApiErrorDetail>[0]) => {
      const messageCode = error.response?.data?.messageCode
      const key = messageCode ? errorMessageKeys[messageCode] : undefined

      toast.error(t('platformAccounts.error.title'), {
        description: key ? t(`platformAccounts.error.${key}`) : getApiErrorDetail(error)
      })

      // 409 nghĩa là trạng thái phía server đã khác - đọc lại trước khi cho bấm tiếp
      if (error.response?.status === 409) refreshList()
    },
    [t, refreshList]
  )

  // Cookie proof là HttpOnly/SameSite=Lax và gắn với đúng phiên này, nên phải mở ngay
  // trên cùng trình duyệt vừa gọi connect. Sang trình duyệt khác là hỏng.
  const openAuthorization = useCallback(
    (session: PlatformAccountSession) => {
      const popup = window.open(session.authorizationUrl, 'platform-account-oauth', POPUP_FEATURES)

      if (!popup) {
        toast.error(t('platformAccounts.error.title'), { description: t('platformAccounts.error.popupBlocked') })

        return
      }

      if (popupTimerRef.current) clearInterval(popupTimerRef.current)

      popupTimerRef.current = setInterval(() => {
        if (!popup.closed) return

        clearInterval(popupTimerRef.current ?? undefined)
        popupTimerRef.current = null
        refreshList()
        toast.info(t('platformAccounts.popupClosed'))
      }, POPUP_POLL_MS)
    },
    [t, refreshList]
  )

  const { mutate: connectAccount, isPending: isConnecting } = useMutation({
    mutationFn: (platform: MarketingPostPlatform) => platformAccountService.connectPlatformAccount({ platform }),
    onSuccess: openAuthorization,
    onError
  })

  const { mutate: reconnectAccount, isPending: isReconnecting } = useMutation({
    mutationFn: (id: string) => platformAccountService.reconnectPlatformAccount({ id }),
    onSuccess: openAuthorization,
    onError
  })

  const { mutate: refreshAccount, isPending: isRefreshing } = useMutation({
    mutationFn: (id: string) => platformAccountService.refreshPlatformAccount({ id }),
    onSuccess: (account) => {
      refreshList()

      // Refresh trả HTTP 200 cả khi token đã chết - phải đọc status chứ không tin mã HTTP
      if (account.status !== PlatformAccountStatus.Connected || account.lastErrorCode) {
        toast.warning(t('platformAccounts.refreshNeedsReauth', { name: account.displayName }), {
          description: account.lastErrorCode ?? undefined
        })

        return
      }

      toast.success(t('platformAccounts.refreshSuccess', { name: account.displayName }))
    },
    onError
  })

  const { mutate: disconnectAccount, isPending: isDisconnecting } = useMutation({
    mutationFn: (id: string) => platformAccountService.disconnectPlatformAccount({ id }),
    onSuccess: (account) => {
      refreshList()
      toast.success(t('platformAccounts.disconnectSuccess', { name: account.displayName }))
    },
    onError
  })

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearInterval(popupTimerRef.current)
    }
  }, [])

  const accountsByPlatform = useCallback(
    (platform: MarketingPostPlatform) => accounts.filter((account: PlatformAccount) => account.platform === platform),
    [accounts]
  )

  return {
    accounts,
    accountsByPlatform,
    isGettingAccounts,
    isBusy: isConnecting || isReconnecting || isRefreshing || isDisconnecting,
    isRefreshing,
    connectAccount,
    reconnectAccount,
    refreshAccount,
    disconnectAccount
  }
}
