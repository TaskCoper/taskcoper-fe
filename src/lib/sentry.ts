import config from '@/shared/config'
import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType
} from 'react-router'

// Tên (chứa một trong các từ này, không phân biệt hoa thường) của header / cookie / query param sẽ bị lọc,
// bổ sung cho danh sách có sẵn của SDK (auth, token, secret, session, key, cookie, password, ...)
const IDENTIFYING_TERMS = ['forwarded', '-ip', 'remote-', 'via', '-user']
const PERSONAL_QUERY_TERMS = ['phone', 'email', 'otp', 'address']

// Breadcrumb xhr/fetch (axios đi qua XHR) giữ nguyên URL gốc, bộ lọc query của dataCollection không áp dụng
// cho breadcrumb. Replay cũng dựng network entry từ chính breadcrumb này nên bỏ query ở đây là phủ cả hai
const stripRequestQuery = (breadcrumb: Sentry.Breadcrumb) => {
  const url: unknown = breadcrumb.data?.url

  if ((breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') && typeof url === 'string') {
    breadcrumb.data = { ...breadcrumb.data, url: url.split(/[?#]/, 1)[0] }
  }

  return breadcrumb
}

// Lỗi mà replay không giúp được gì: mất mạng / timeout (axios `Network Error`, `timeout of Nms exceeded`), API trả
// lỗi client (`status code 4xx`, ví dụ validate hoặc 403) và thông báo vô hại ResizeObserver của trình duyệt.
// Lỗi vẫn được báo như cũ, chỉ bỏ replay của nó. Lỗi 5xx và mọi lỗi khác vẫn có replay
const NOISY_AXIOS_MESSAGE = /^(Network Error|timeout of \d+ms exceeded|Request failed with status code 4\d\d)$/

const isNoisyForReplay = (event: Sentry.ErrorEvent) => {
  const values = event.exception?.values
  const error = values?.[values.length - 1]
  const message = error?.value ?? ''

  return (error?.type === 'AxiosError' && NOISY_AXIOS_MESSAGE.test(message)) || /^ResizeObserver loop/.test(message)
}

// Chỉ bật khi CI truyền VITE_SENTRY_ENVIRONMENT (htm-dev → development, htm-prod → production). Build dev / prod là project khác nên không báo về đây
Sentry.init({
  dsn: 'https://a5bc28c68493eb62675fedb7c69493bf@o4512247139794944.ingest.us.sentry.io/4512247582228480',
  enabled: Boolean(config.sentryEnvironment),
  environment: config.sentryEnvironment,

  // Không đặt `release`: plugin Vite tự inject từ SENTRY_RELEASE (commit SHA) lúc build.
  // Cũng không thêm tracePropagationTargets cho API cross-origin: BE phải cho phép header sentry-trace / baggage
  // trong CORS, nếu không request sẽ bị chặn. Mặc định chỉ gắn header cho request cùng origin
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,

  dataCollection: {
    // Chỉ chặn SDK tự suy IP của user, Sentry.setUser({ id }) vẫn được áp dụng
    userInfo: false,
    httpBodies: [],
    httpHeaders: { deny: IDENTIFYING_TERMS },
    cookies: { deny: IDENTIFYING_TERMS },
    urlQueryParams: { deny: [...IDENTIFYING_TERMS, ...PERSONAL_QUERY_TERMS] }
  },
  beforeBreadcrumb: stripRequestQuery,

  // Quota chỉ tính replay được gửi đi: 1% session cộng mọi session có lỗi (trừ lỗi nhiễu ở trên). Session còn lại
  // ghi ở chế độ buffer (giữ trong bộ nhớ, chưa gửi gì) cho tới khi có lỗi, nên replaysOnErrorSampleRate cũng phủ
  // các session không được sample. Quota Replay dùng chung org với hoatheomua-fe. Trang admin hiển thị dữ liệu
  // khách hàng nên mask toàn bộ text / input và chặn media; body và header của request không được ghi vì
  // networkDetailAllowUrls để trống. Không lọc bot / Lighthouse như hoatheomua-fe: app này nằm sau đăng nhập
  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
      beforeErrorSampling: (event) => !isNoisyForReplay(event)
    })
  ],
  replaysSessionSampleRate: import.meta.env.PROD ? 0.01 : 0,
  replaysOnErrorSampleRate: 1
})

// Đặt tên transaction theo route (/projects/:id) thay vì URL thật
export const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter)
