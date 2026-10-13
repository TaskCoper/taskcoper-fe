import type { Me } from '@/features/users/types'
import { queryKeys } from '@/lib/query-keys'
import * as Sentry from '@sentry/react'
import { hashKey, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

const ME_QUERY_KEY = queryKeys.auth.me()
const ME_QUERY_HASH = hashKey(ME_QUERY_KEY)

// Đồng bộ user đang đăng nhập sang Sentry, chỉ gửi `id` (không email, tên, avatar).
// Lắng nghe cache của query `me` thay vì gọi useGetMe để không tạo thêm observer hay request /me:
// guard nào đã load session thì component này đi theo. Sign-out gọi queryClient.clear() nên user được xoá khỏi Sentry
export default function SentryUserContext() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let currentId: string | null = null

    const sync = () => {
      const id = queryClient.getQueryData<Me | null>(ME_QUERY_KEY)?.id ?? null

      if (id === currentId) return

      currentId = id
      Sentry.setUser(id ? { id } : null)
    }

    sync()

    return queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryHash === ME_QUERY_HASH) sync()
    })
  }, [queryClient])

  return null
}
