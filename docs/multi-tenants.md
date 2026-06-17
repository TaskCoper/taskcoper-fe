# Hướng dẫn Multi-tenant

> Tài liệu cho thành viên mới: giải thích **vì sao có**, **các file làm gì**, **luồng chạy thế nào**, và **cách thêm/sửa** cho hệ thống multi-tenant của TaskCoper.
>
> Phạm vi đã mở rộng: từ chỗ ban đầu chỉ có **feature flag**, lớp multi-tenant giờ phủ thêm **nav riêng**, **route riêng**, **bản dịch riêng (i18n)**, và **API client riêng** — tất cả qua **một entry duy nhất** trong `TENANT_CONFIGS`.

---

## 1. Bối cảnh

TaskCoper đang chuyển từ sản phẩm SaaS chung sang mô hình **B2B đa khách hàng**. Mỗi khách hàng B2B (tenant):

- Chỉ được dùng một **subset** trong các module sản phẩm (vd: chỉ Task Management).
- Có thể có **tính năng / trang / sidebar riêng** chỉ thuộc tenant đó.
- Có thể có **bản dịch UI riêng** (override label sẵn có, hoặc thêm key mới cho trang riêng).
- Có thể có **backend riêng** (API host khác) song song với API chung của TaskCoper.
- Vẫn dùng **chung một codebase, chung một build pipeline** — không fork repo, không build riêng, không subdomain.

**Outcome:** một lớp tenant có kiểu (typed), nguồn sự thật là `tenants.config.ts`. Mặc định = tất cả flag bật + không có tenant nào đăng ký → khách hàng cũ không bị ảnh hưởng. Thêm khách hàng mới = **một entry** trong registry + (tuỳ chọn) một bundle locale, KHÔNG đụng vào loader / API client / sidebar / route file.

**Cách định danh tenant:** dùng `me.organizationId` từ `useGetMe()` (có sẵn trong JWT + React Query cache). Sau khi user đăng nhập, tra trong `TENANT_CONFIGS` để biết tenant này được bật những gì và có data riêng gì.

---

## 2. Các module hiện tại

| Module key         | Phạm vi                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `home`             | Trang public `/` (HomePage marketing)                                                                                        |
| `taskManagement`   | Toàn bộ feature `projects` (project, milestone, task, label, member, role, analytics, charts)                                |
| `mentorNetworking` | Mentor packages, vouchers, applications, requests, purchases, transactions, network                                          |
| `meetings`         | `/calendar` toàn cục + calendar/schedules (Meetings TRONG project vẫn theo permission backend, không bị flag này khoá riêng) |
| `news`             | `/news`                                                                                                                      |

> Luôn bật (không gắn flag): `auth`, `users`, `notifications`, `domains`, `verify-email`, profile, settings.

`custom.*` flag mở (`Record<string, boolean>`) — thêm cờ không cần sửa type. Mỗi tenant tự khai báo cờ custom của mình trong `tenants.config.ts`.

---

## 3. Cấu trúc thư mục

```
src/lib/feature-flags/
├── types.ts                    # TenantConfig, ModuleKey, FeatureKey,
│                                 TenantNavMainItem, TenantNavSubItem, TenantLocaleLoader
├── default.config.ts           # Mặc định = TẤT CẢ module flag = true
├── tenants.config.ts           # Registry: organizationId → Partial<TenantConfig>
│                                 (mặc định EMPTY — không có tenant nào)
├── resolve-tenant-config.ts    # Hàm merge default + override
├── use-feature-flags.ts        # Hooks: useTenantConfig, useFeature,
│                                 useRoleHomePath, isFeatureEnabled, resolveFeatureCheck
├── use-filtered-nav-items.ts   # Hook lọc nav GLOBAL items (dùng cho top-nav + sidebar)
├── tenant-nav-items.ts         # Hook useTenantNavMain — đọc nav riêng từ tenant config
├── redirect-loop.ts            # Helper phát hiện loop redirect
└── index.ts                    # Re-export gọn

src/lib/i18n/
├── i18n.ts                     # init i18next: ns=['translation'], defaultNS+fallbackNS='translation'
├── locales/{en,vi}.json        # Bundle base — strict-typed, là nguồn sự thật
├── load-tenant-namespace.ts    # Dynamic loader cho namespace của tenant
├── use-tenant-translation.ts   # Hook đọc tenant ns + fallback base
└── types.ts                    # I18nKey

src/lib/axios.ts                # createApiClient(baseURL) factory + shared refresh handler

src/tenants/                    # Nhà cho tenant data (per-slug). Mặc định trống.
└── <slug>/                     # Khi thêm tenant, dựng ở đây.
    ├── config.ts               # Partial<TenantConfig> + ORG_ID
    ├── locales/{en,vi}.json    # Tenant namespace bundle
    ├── nav-items.ts            # (Tuỳ chọn) sidebar items riêng
    ├── routes.tsx              # (Tuỳ chọn) RouteObject[] mount trong user workspace
    ├── lib/api.ts              # (Tuỳ chọn) API client riêng (createApiClient)
    ├── components/             # (Tuỳ chọn) component dùng riêng
    └── pages/                  # (Tuỳ chọn) page component

src/layouts/
├── feature-flag-guard.layout.tsx   # FeatureFlagGuardLayout + TenantLandingRedirect + TenantConfigLoading
├── auth-guard.layout.tsx           # AuthGuard (đã loop-guarded) + load tenant namespace
└── role-guard.layout.tsx           # RoleGuard (đã loop-guarded)

i18next.config.js               # Loại src/tenants/** khỏi extract + lint của base
package.json (i18n:check)        # `--exclude src/tenants` — i18n verify chỉ chạy trên base
vite.config.ts (server.proxy)    # Mechanism cho dev-cookie proxy (chỉ có /api của TaskCoper)
HOW_TO_ADD_A_TENANT.md          # Checklist 2-bước onboarding ở root repo
```

---

## 4. Ý nghĩa từng file

### 4.1 `types.ts` — Khung dữ liệu

```ts
export type ModuleKey = 'home' | 'taskManagement' | 'mentorNetworking' | 'meetings' | 'news'

export type TenantLocaleLoader = () => Promise<{ default: Record<string, unknown> }>

export type TenantNavSubItem = {
  title: string
  url: string
  activePatterns?: string[]
  activeExcludePatterns?: string[]
}

export type TenantNavMainItem = {
  title: string
  url: string
  icon: LucideIcon
  items: TenantNavSubItem[]
  roles?: Role[]
  feature?: FeatureKey
}

export type TenantConfig = {
  modules: Record<ModuleKey, boolean>
  custom: Record<string, boolean>
  defaultLanding: string
  logoUrl: string
  // Multi-tenant i18n
  i18nNamespace?: string
  locales?: Record<string, TenantLocaleLoader>
  // Multi-tenant UI
  navMain?: TenantNavMainItem[]
  workspaceRoutes?: RouteObject[]
}

export type FeatureKey = `module.${ModuleKey}` | `custom.${string}`
```

- `FeatureKey` là **dot-path** thống nhất. Ví dụ: `'module.taskManagement'`, `'custom.orderManagement'`.
- `custom` để mở (`Record<string, boolean>`) — thêm cờ không cần sửa type.
- `i18nNamespace` + `locales`: tên namespace runtime cho tenant + map ngôn ngữ → dynamic-import loader. Bundle chỉ tải khi user thuộc tenant đó.
- `navMain`: section sidebar phụ chèn **sau** global nav. Vẫn lọc bằng `roles` và `feature` y như global.
- `workspaceRoutes`: `RouteObject[]` được mount **bên trong** `UserWorkspaceLayout`. Đọc tại module-load time từ `TENANT_CONFIGS` — KHÔNG đụng vào `user.route.tsx`.

> `TenantNavMainItem` / `TenantNavSubItem` đặt trong `types.ts` (không phải `tenant-nav-items.ts`) để tránh circular import — nhờ vậy `TenantConfig` có thể tham chiếu kiểu mà không cần import từ file hook.

### 4.2 `default.config.ts` — Khi không match tenant nào

```ts
export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  modules: { home: true, taskManagement: true, mentorNetworking: true, meetings: true, news: true },
  custom: {},
  defaultLanding: '/projects',
  logoUrl: '/'
}
```

**Áp dụng khi:**

- User chưa đăng nhập (`organizationId` là `null`).
- Hoặc `organizationId` không có entry trong `TENANT_CONFIGS` (khách hàng cũ, dev account, registry rỗng…).

**Mặc định = tất cả flag bật, không tenant data** → không khách hàng nào bị thay đổi hành vi cho đến khi thêm entry vào registry.

### 4.3 `tenants.config.ts` — Registry per-tenant

Mặc định **trống rỗng** — chưa có tenant nào đăng ký:

```ts
import type { TenantConfig } from './types'

// Mỗi entry là Partial<TenantConfig> merge vào DEFAULT_TENANT_CONFIG.
// Thêm tenant = thêm entry ở đây + bundle locale. KHÔNG sửa loader, sidebar,
// axios, hay route file. Xem HOW_TO_ADD_A_TENANT.md.
export const TENANT_CONFIGS: Record<string, Partial<TenantConfig>> = {}
```

Ví dụ điền entry cho tenant tưởng tượng `acme`:

```ts
import { ACME_ORG_ID, acmeConfig } from '@/tenants/acme/config'

export const TENANT_CONFIGS: Record<string, Partial<TenantConfig>> = {
  [ACME_ORG_ID]: acmeConfig
}
```

- Khóa là `organizationId` (UUID) khách hàng.
- Giá trị là `Partial<TenantConfig>` — chỉ ghi đè field nào khác default.
- `Partial<TenantConfig>` chứa **tất cả** dữ liệu của tenant: modules, custom flag, landing, logo, i18n namespace, locales, navMain, workspaceRoutes. Một entry = một tenant.
- File này là **nguồn sự thật duy nhất** cho cấu hình per-tenant. Đổi config = sửa file này (hoặc các file tenant nó import), KHÔNG sửa nơi khác.

### 4.4 `resolve-tenant-config.ts` — Logic merge

```ts
export function resolveTenantConfig(organizationId: string | null | undefined): TenantConfig {
  if (!organizationId) return DEFAULT_TENANT_CONFIG
  const override = TENANT_CONFIGS[organizationId]
  if (!override) return DEFAULT_TENANT_CONFIG
  return {
    modules: { ...DEFAULT_TENANT_CONFIG.modules, ...override.modules },
    custom: { ...DEFAULT_TENANT_CONFIG.custom, ...override.custom },
    defaultLanding: override.defaultLanding ?? DEFAULT_TENANT_CONFIG.defaultLanding,
    logoUrl: override.logoUrl ?? DEFAULT_TENANT_CONFIG.logoUrl,
    i18nNamespace: override.i18nNamespace,
    locales: override.locales,
    navMain: override.navMain,
    workspaceRoutes: override.workspaceRoutes
  }
}
```

Cho `organizationId`, trả về `TenantConfig` đã merge đầy đủ. Field tenant-only (`i18nNamespace`, `locales`, `navMain`, `workspaceRoutes`) **không có** trong `DEFAULT_TENANT_CONFIG` → resolve = forward thẳng từ override (hoặc `undefined`).

> **Migration tương lai:** khi backend muốn cầm flag, chỉ cần đổi thân hàm này thành React Query call `/v1/organization/{id}/feature-flags` — toàn bộ consumer (hook, guard, nav filter, i18n loader) giữ nguyên.

### 4.5 `use-feature-flags.ts` — Hooks và utilities

| Hàm / Hook                         | Mục đích                                                                          | Khi dùng                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `useTenantConfig()`                | Trả về `TenantConfig` đã resolve cho user hiện tại (dựa vào `useGetMe`)           | Khi cần đọc nhiều flag / nav / i18n cùng lúc          |
| `useFeature(key)`                  | Bool — feature đó có bật không                                                    | Trong component, check 1 flag                         |
| `useRoleHomePath()`                | Đích redirect post-auth (admin → role home cứng; user → `config.defaultLanding`)  | Trong guard `Navigate`                                |
| `resolveFeatureCheck(config, key)` | Hàm thuần (không phải hook) — check feature trong một config có sẵn               | Dùng trong `.filter()`, `useMemo`, callback           |
| `isFeatureEnabled(orgId, key)`     | Hàm thuần — check feature theo `orgId` trực tiếp (gọi `resolveTenantConfig` ngầm) | NGOÀI React (axios interceptor, zustand action, util) |

**Quy tắc:** trong component → ưu tiên `useFeature` hoặc `useTenantConfig`. Ngoài React → `isFeatureEnabled` / `resolveFeatureCheck`.

### 4.6 `use-filtered-nav-items.ts` — Lọc nav GLOBAL

```ts
export type GuardedNavItem = {
  roles?: Role[]
  feature?: FeatureKey
}

export function useFilteredNavItems<T extends GuardedNavItem>(items: T[]): T[]
```

Nhận một mảng items **dùng chung cho mọi tenant** (vd `NAV_MAIN_CONFIG` trong sidebar, `navigations` trong top-nav), lọc theo `roles` (vai trò user) + `feature` (flag tenant). Dùng bởi cả:

- `src/components/sidebar/users/user-workspace-sidebar.tsx` (sidebar workspace)
- `src/layouts/user-default.layout.tsx` (top-nav header)

**Vì sao tách hook chung:** nếu để inline ở mỗi nơi, sửa luật visibility ở một bên mà quên bên kia → hai surface lệch nhau. Hook chung = một nơi sửa, hai nơi update đồng bộ.

### 4.7 `tenant-nav-items.ts` — Sidebar riêng cho tenant

```ts
export function useTenantNavMain(): TenantNavMainItem[] {
  const { me } = useGetMe()
  const config = useTenantConfig()
  const items = config.navMain ?? EMPTY_NAV_MAIN
  return useMemo(
    () =>
      items.filter((item) => {
        if (item.roles && !item.roles.includes(me?.role as Role)) return false
        if (item.feature && !resolveFeatureCheck(config, item.feature)) return false
        return true
      }),
    [items, me?.role, config]
  )
}
```

Trả về **section sidebar phụ** của tenant hiện tại (đọc từ `config.navMain`), đã lọc theo `roles` + `feature`. Khác `useFilteredNavItems` ở chỗ:

| Hook                  | Input                                      | Khi nào dùng                       |
| --------------------- | ------------------------------------------ | ---------------------------------- |
| `useFilteredNavItems` | Mảng items **truyền vào** (hardcode chung) | Lọc menu mà mọi tenant có thể thấy |
| `useTenantNavMain`    | Đọc từ `config.navMain` (tenant tự khai)   | Section phụ chỉ tenant đó có       |

Sidebar workspace nối hai kết quả (`...filteredNavMain, ...tenantNavMain`) — không có tenant đăng ký → `tenantNavMain` là `[]` → sidebar không hiển thị section phụ nào.

### 4.8 `i18n.ts` — Khởi tạo i18next cho multi-namespace

```ts
i18n.use(initReactI18next).init({
  resources,
  ns: ['translation'],
  defaultNS: 'translation',
  fallbackNS: 'translation',
  ...
})
```

- Lúc khởi động chỉ đăng ký namespace **base** (`translation`) từ `src/lib/i18n/locales/{en,vi}.json` — strict-typed qua `I18nKey`.
- `fallbackNS: 'translation'` là cốt lõi của fallback: tenant namespace thiếu key nào → tra ngược về base.
- Tenant namespace KHÔNG đăng ký lúc init — load động sau khi auth resolve (xem 4.9).

### 4.9 `load-tenant-namespace.ts` — Dynamic loader

```ts
export const loadTenantNamespace = (
  namespace: string,
  locales: Record<string, TenantLocaleLoader>
): Promise<void>
```

- **Idempotent**: cùng `(namespace, language)` chỉ load đúng một lần. `Set loaded` + `Map inFlight` dedupe các call song song.
- **Fallback ngôn ngữ**: thiếu loader cho `vi-VN` → lùi về `vi` → lùi về `en`.
- Sau khi import xong, gọi `i18n.addResourceBundle(lng, namespace, mod.default, true, true)` — đăng ký vào i18next runtime.
- **Wiring**: `AuthGuardLayout` (`src/layouts/auth-guard.layout.tsx`) gọi loader một lần khi `useTenantConfig()` resolve, và đăng ký `i18n.on('languageChanged', ...)` để nạp đúng bundle khi user đổi ngôn ngữ giữa session.

### 4.10 `use-tenant-translation.ts` — Hook đọc tenant ns

```ts
export function useTenantTranslation() {
  const { i18nNamespace } = useTenantConfig()
  const ns = (i18nNamespace ? [i18nNamespace, 'translation'] : 'translation') as 'translation'
  return useTranslation(ns)
}
```

- Nếu tenant có `i18nNamespace` → tra ns tenant trước, fallback xuống `translation`.
- Nếu tenant KHÔNG có → giống `useTranslation()` thuần.
- `t` widen sang `(key: string) => string` (không strict-typed) vì `i18next.config.js` đã loại `src/tenants/**` khỏi extract / lint / types generation — sinh type per-tenant không đáng cho vài chục key.

Component dùng `useTenantTranslation()` thay `useTranslation()` ở chỗ nào muốn cho tenant override copy. Trang chung của app vẫn dùng `useTranslation()` để giữ strict typing.

### 4.11 `src/lib/axios.ts` — Factory `createApiClient`

```ts
export const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({ baseURL: `${baseURL}/api`, withCredentials: true, ... })
  // request interceptor: Accept-Language + X-Timezone
  // response interceptor: 401 ExpiredAccessToken / MissingAccessToken → refresh + retry
  return instance
}

export const api = createApiClient(config.baseURL) // client cho TaskCoper API
```

- **Refactor**: client `api` cũ giờ chỉ là 1 trường hợp riêng của factory. Tenant nào có backend riêng tạo client mới bằng `createApiClient(<tenant-base-url>)`.
- **State refresh-token shared**: biến `isRefreshing` + `refreshSubscribers` đặt **module-scope**, không nằm trong factory. Concurrent 401 ở bất kỳ client nào chỉ trigger **một** refresh — refresh dùng `axios.post` thẳng tới `config.baseURL` (refresh endpoint là của TaskCoper API).
- **PUBLIC_ROUTE_PATHS**: response interceptor không hard-reload `/sign-in` khi đang ở public path → tránh loop ở public page. Cập nhật danh sách này khi thêm public route.

### 4.12 `redirect-loop.ts` — Phát hiện loop

Y như trước. Mọi guard mà redirect đến tenant-derived path đều chạy qua `isRedirectLoop(currentPathname, target, source)`. Phòng config sai (vd `defaultLanding: '/projects'` mà `taskManagement: false`) gây loop vô hạn.

### 4.13 `feature-flag-guard.layout.tsx` — Route guards

| Component                              | Vai trò                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `FeatureFlagGuardLayout({ requires })` | Bọc nhóm route. Nếu module tắt → redirect về `defaultLanding`. Có loop guard.                                              |
| `TenantLandingRedirect`                | Component dùng cho catch-all `path: '*'` — redirect về `defaultLanding`. Có loop guard.                                    |
| `TenantConfigLoading` _(nội bộ)_       | Loading overlay full-screen (`fixed inset-0 z-1000 bg-background`) trong lúc `useGetMe` đang resolve — chặn flash content. |

### 4.14 `auth-guard.layout.tsx` & `role-guard.layout.tsx`

- Auth check + role check như cũ.
- Đích redirect post-auth dùng `useRoleHomePath()` (tenant-aware) thay vì `getRoleHomePath(...)` cứng.
- Có loop guard ở mọi nhánh `Navigate` đến tenant-derived path.
- **MỚI (auth guard)**: `useEffect` gọi `loadTenantNamespace(i18nNamespace, locales)` khi config resolve, đồng thời lắng `i18n.on('languageChanged', ...)` để nạp lại bundle đúng ngôn ngữ khi user đổi. Không có `i18nNamespace` / `locales` → effect no-op.

### 4.15 Sidebar + Route mount

- `src/components/sidebar/users/user-workspace-sidebar.tsx`: nối `useFilteredNavItems(NAV_MAIN_CONFIG)` (global) với `useTenantNavMain()` (tenant) — global trước, tenant sau. Không có tenant → chỉ thấy global.
- `src/routes/user.route.tsx`: build mảng `tenantWorkspaceRoutes = Object.values(TENANT_CONFIGS).flatMap(c => c.workspaceRoutes ?? [])` tại module-load, spread vào `children` của workspace layout. Registry rỗng → mảng rỗng → không có route tenant nào mount.

---

## 5. Luồng chạy (Flow)

### 5.1 Đường đi của một request

```
URL bất kỳ
│
├─ AppLayout (root)
│  ├─ AuthGuardLayout
│  │  ├─ useGetMe loading → render logo loading screen toàn màn hình
│  │  ├─ Unauth → Navigate → /sign-in
│  │  ├─ Cần verify email → Navigate → /verify-email
│  │  ├─ ⇨ Tenant ns load: useEffect gọi loadTenantNamespace nếu config có i18nNamespace + locales
│  │  └─ OK → <Outlet />
│  │
│  └─ RoleGuardLayout(['user'])
│     ├─ Sai userType (admin trên route user) → Navigate → getRoleHomePath(userType)
│     ├─ Sai allowedUserRoles → Navigate → useRoleHomePath() (= config.defaultLanding)
│     └─ OK → <Outlet />
│        │
│        └─ UserDefaultLayout (header + top-nav)
│           │  • Top-nav filter bằng useFilteredNavItems
│           │  • Logo link = tenantConfig.logoUrl
│           │
│           └─ UserWorkspaceLayout (sidebar + content)
│              │  • Sidebar = useFilteredNavItems(NAV_MAIN_CONFIG)   ← global
│              │             ++ useTenantNavMain()                  ← tenant phụ
│              │
│              └─ FeatureFlagGuardLayout requires='module.X'
│                 ├─ useGetMe loading → TenantConfigLoading (overlay full-screen)
│                 ├─ Module bật → <Outlet />  (có thể là page chung hoặc tenant workspaceRoutes)
│                 ├─ Module tắt + loop detected → console.error + null
│                 └─ Module tắt → Navigate → defaultLanding
│                    │
│                    └─ Page component (hoặc redirect tiếp nếu defaultLanding cũng bị chặn)
```

### 5.2 Tenant namespace — Khi nào load, ai download

1. User chưa đăng nhập → `useTenantConfig()` trả `DEFAULT_TENANT_CONFIG` → không có `i18nNamespace`/`locales` → effect `loadTenantNamespace` no-op → KHÔNG tải bundle tenant.
2. User đăng nhập, `organizationId` không match → vẫn dùng default → KHÔNG tải.
3. User đăng nhập, `organizationId` match một tenant có `i18nNamespace` + `locales`:
   - Effect chạy → `loadTenantNamespace(ns, locales)` → `locales[currentLng]()` (Vite code-split → 1 chunk JSON) → `i18n.addResourceBundle(lng, ns, ...)`.
   - Từ giờ component dùng `useTenantTranslation()` sẽ thấy override key của tenant.
   - User đổi ngôn ngữ (`i18n.changeLanguage('en')`) → listener nạp bundle ngôn ngữ mới của tenant.
4. User của tenant **khác** KHÔNG download bundle này — `() => import(...)` chỉ chạy khi effect kích hoạt với cấu hình tương ứng.

### 5.3 Ví dụ cụ thể — Khách hàng task-only truy cập `/news`

Tenant config: `news: false`, `taskManagement: true`, `defaultLanding: '/projects'`.

1. User gõ `/news` → AppLayout → AuthGuard (đã auth) → RoleGuard (đúng `user`) → UserDefaultLayout → UserWorkspaceLayout.
2. Route `/news` được bọc `FeatureFlagGuardLayout requires='module.news'`.
3. Guard chạy:
   - `useGetMe` đã resolve (cache warm) → bỏ qua loading.
   - `resolveFeatureCheck(config, 'module.news')` → `false`.
   - `isRedirectLoop('/news', '/projects', ...)` → `false` (path khác nhau).
   - Return `<Navigate to='/projects' replace />`.
4. Router chuyển sang `/projects`, render `ProjectsPage`. User KHÔNG kịp thấy `NewsPage`.

### 5.4 Cold reload — Tránh flash content

Khi user hard refresh tại URL bị chặn:

1. `useGetMe` đang fetch → chưa biết `organizationId` → config tạm là DEFAULT (mọi flag = true).
2. Nếu guard chạy ngay → flag = true → render trang bị cấm.
3. Khi `useGetMe` resolve, config flip → redirect — **flash content đã xảy ra rồi**.

**Cách khắc phục:** `FeatureFlagGuardLayout` kiểm tra `isGettingMe`. Nếu đang loading → render `TenantConfigLoading` (overlay full-screen) thay vì trả `<Outlet />`. Component con không mount, không có flash.

### 5.5 Loop guard — Misconfig safety net

Nếu tenant config sai (vd `defaultLanding` trỏ vào module đã tắt):

```
User visit anywhere → blocked → Navigate to /projects
↓
/projects → FeatureFlagGuardLayout(taskManagement) → tắt → Navigate to /projects → LOOP
```

`isRedirectLoop` chặn:

1. So sánh `location.pathname` với `target`.
2. Bằng nhau → `console.error('[feature-flags] Redirect loop detected — ...')` + return `true`.
3. Caller bail out, render `null`. Trình duyệt không bị treo.

Dev mở console thấy lỗi → biết phải sửa `tenants.config.ts`.

---

## 6. Cách thêm/sửa

### 6.1 Onboard tenant mới — Tổng quan 2 bước

Theo `HOW_TO_ADD_A_TENANT.md` ở root repo. Tóm tắt:

1. **Step 1 — Config entry**: tạo `src/tenants/<slug>/config.ts` export `Partial<TenantConfig>` (kèm `ORG_ID`), rồi đăng ký vào `TENANT_CONFIGS` trong `src/lib/feature-flags/tenants.config.ts`.
2. **Step 2 — Locale bundle**: tạo `src/tenants/<slug>/locales/{en,vi}.json` (rỗng cũng OK), khai báo `i18nNamespace` + `locales` trong config.

**KHÔNG đụng** vào:

- `src/lib/i18n/i18n.ts` (init i18next),
- `src/lib/i18n/load-tenant-namespace.ts` (loader),
- `src/lib/axios.ts` (factory),
- `src/components/sidebar/users/user-workspace-sidebar.tsx` (sidebar),
- `src/routes/user.route.tsx` (route file).

### 6.2 Thêm sidebar section riêng cho tenant

Trong `src/tenants/<slug>/nav-items.ts`:

```ts
import type { TenantNavMainItem } from '@/lib/feature-flags'
import { PackageIcon } from 'lucide-react'

export const acmeNavMain: TenantNavMainItem[] = [
  {
    title: 'Orders',
    url: '/acme/orders',
    icon: PackageIcon,
    feature: 'custom.orderManagement',
    items: [{ title: 'List', url: '/acme/orders' }]
  }
]
```

Gắn vào config:

```ts
import { acmeNavMain } from './nav-items'

export const acmeConfig: Partial<TenantConfig> = {
  ...
  navMain: acmeNavMain
}
```

`useTenantNavMain` đọc `config.navMain` → append vào sidebar. Item nào có `feature` không khớp / `roles` không khớp tự ẩn.

### 6.3 Thêm route riêng cho tenant

Trong `src/tenants/<slug>/routes.tsx`:

```tsx
import { FeatureFlagGuardLayout } from '@/lib/feature-flags'
import { lazy } from 'react'
import { Outlet, type RouteObject } from 'react-router'

const OrdersListPage = lazy(() => import('./pages/orders-list.page'))

export const acmeWorkspaceRoutes: RouteObject[] = [
  {
    path: 'acme',
    element: <Outlet />,
    children: [
      {
        element: <FeatureFlagGuardLayout requires='custom.orderManagement' />,
        children: [{ path: 'orders', element: <OrdersListPage /> }]
      }
    ]
  }
]
```

Gắn vào config:

```ts
import { acmeWorkspaceRoutes } from './routes'

export const acmeConfig: Partial<TenantConfig> = {
  ...
  workspaceRoutes: acmeWorkspaceRoutes
}
```

`src/routes/user.route.tsx` tự pick lên qua `Object.values(TENANT_CONFIGS).flatMap(c => c.workspaceRoutes ?? [])`.

> **Lưu ý lazy-load**: `RouteObject[]` khai báo `element: <LazyComp />` nên page chỉ tải khi user truy cập đúng path. Module-load chỉ phải đọc metadata route, không tải code page của tenant khác.

### 6.4 Thêm bản dịch riêng cho tenant

1. Tạo `src/tenants/<slug>/locales/en.json` + `vi.json` (rỗng cũng OK).
2. Khai báo `i18nNamespace` + `locales` trong config:
   ```ts
   i18nNamespace: 'acme',
   locales: {
     en: () => import('./locales/en.json'),
     vi: () => import('./locales/vi.json')
   }
   ```
3. Component đặc thù dùng `useTenantTranslation()` thay `useTranslation()`.

**Override key của base:** thêm key cùng path trong tenant bundle:

```json
// src/tenants/acme/locales/vi.json
{ "account": { "logout": "Đăng xuất khỏi cửa hàng" } }
```

Component dùng `useTenantTranslation()` lấy bản override; `useTranslation()` thuần vẫn lấy base.

→ Muốn override "thấm" được vào shared component, shared component phải migrate sang `useTenantTranslation`. Rollout dần tuỳ nhu cầu rebrand.

**KHÔNG cần** sửa `i18n.ts` hay `i18next.d.ts` khi thêm tenant — đây chính là điểm chính của thiết kế dynamic.

### 6.5 Thêm backend riêng cho tenant

Nếu tenant gọi API host khác:

1. Thêm env var: `VITE_ACME_API_BASE_URL` vào `.env.development` / `.env.production`.
2. Tạo `src/tenants/<slug>/lib/api.ts`:
   ```ts
   import { createApiClient } from '@/lib/axios'
   export const acmeApi = createApiClient(import.meta.env.VITE_ACME_API_BASE_URL)
   ```
3. Dev cookie phải đi qua proxy → thêm entry trong `vite.config.ts`:
   ```ts
   '/acme-api': {
     target: 'https://acme-api.example.com',
     changeOrigin: true,
     rewrite: (path) => path.replace(/^\/acme-api/, ''),
     cookieDomainRewrite: 'localhost'
   }
   ```

`createApiClient` cấp sẵn token refresh, language header, timezone — tenant client kế thừa hết. Refresh-token state chia sẻ cross-client: 401 đồng thời ở `api` và `acmeApi` chỉ trigger một refresh.

### 6.6 Thêm module mới (ví dụ `chat`)

1. **types.ts** — thêm vào `ModuleKey`:
   ```ts
   export type ModuleKey = '...' | 'chat'
   ```
2. **default.config.ts** — thêm `chat: true` vào `modules`. (Default bật → tenant cũ không bị thay đổi.)
3. **Bọc route** trong `user.route.tsx`:
   ```tsx
   {
     element: <FeatureFlagGuardLayout requires='module.chat' />,
     children: [{ path: 'chat', element: <ChatPage /> }]
   }
   ```
4. **Gắn vào nav** (sidebar / top-nav) — thêm `feature: 'module.chat'` vào item mới.
5. **Cập nhật QA doc** `docs/feature-flags-test-cases.md` — thêm row B cho `/chat`.

### 6.7 Thêm custom flag

1. Trong tenant config (`src/tenants/<slug>/config.ts`), thêm vào `custom`:
   ```ts
   custom: {
     weeklyReport: true
   }
   ```
2. Trong component cần gate:
   ```tsx
   const enabled = useFeature('custom.weeklyReport')
   if (!enabled) return null
   ```
3. Custom flag KHÔNG cần thêm vào `default.config.ts` (default = false nếu không có).

### 6.8 Gate route / component / nav

| Tình huống        | Cách làm                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Gate route        | Bọc trong `<FeatureFlagGuardLayout requires='module.X' />` (đặt **NGOÀI** `RoleGuardLayout`). |
| Gate component    | `const enabled = useFeature('module.X' \| 'custom.X'); if (!enabled) return null`             |
| Gate nav (global) | Thêm `feature` vào item config, để `useFilteredNavItems` lọc.                                 |
| Gate nav (tenant) | Thêm `feature` vào `TenantNavMainItem`, để `useTenantNavMain` lọc.                            |

---

## 7. Cảnh báo TRƯỚC khi thay đổi config

Đọc kỹ trước khi sửa `tenants.config.ts` / tenant config files. Sai chỗ này → user gặp loop, blank page, flash content, hoặc tenant bundle không tải.

### 7.1 `defaultLanding`

- ✅ Phải nằm trong module ĐANG BẬT cho tenant này.
- ✅ Phải truy cập được bởi role thông thường:
  - Đừng chọn Mentor-only (`/packages`, `/vouchers`, `/calendar/schedules`) nếu user phổ thông là `User`.
  - Đừng chọn User-only (`/applications`) nếu tenant chủ yếu Mentor.
  - Đừng chọn admin-only (`/dashboard`, `/manage`).
- ❌ KHÔNG dùng `/sign-in`, `/sign-up`, `/verify-email`.
- ❌ Tránh deep project paths (`/projects/<id>/<section>`) — phụ thuộc per-project permission của từng user.
- 🟢 Default an toàn: `/projects` (với `taskManagement: true`), `/` (với `home: true`), `/users/<self>` (luôn có quyền).
- 🆕 Có thể trỏ vào `workspaceRoutes` của tenant (vd `/acme/orders`) nếu route đó luôn truy cập được — nhưng nhớ kèm `custom.<flag>: true` tương ứng.

### 7.2 `logoUrl`

- ✅ Cùng quy tắc với `defaultLanding`.
- ✅ Với `home: true` → thường để `/` (marketing home).
- ✅ Với `home: false` → để bằng `defaultLanding` (hoặc một path khác trong module bật) để click logo không bounce qua loading overlay.

### 7.3 `modules`

- Tắt module nào → kiểm tra lại `defaultLanding` và `logoUrl` không trỏ vào đó.
- Khi tắt `mentorNetworking`, ngoài route mentor còn ẩn: Network, News (mentor-section), Transactions, Purchases, Applications, Packages, Vouchers, payments/checkout.

### 7.4 `custom`

- Bật cờ KHÔNG tự bật tính năng. Phải có code `useFeature('custom.X')` (hoặc gate route `requires='custom.X'`) đâu đó.
- Grep `useFeature('custom.X')` + `requires='custom.X'` trước khi thêm cờ mới để chắc tên đúng.
- Tên cờ là string thường — typo silently → `false`.

### 7.5 `i18nNamespace` + `locales`

- ✅ `i18nNamespace` unique giữa các tenant — tránh hai tenant cùng tên ns ghi đè nhau.
- ✅ Tránh dùng `'translation'` (tên ns base) — `addResourceBundle` ghi đè key base, không phải override per-tenant.
- ✅ Key trong bundle tenant đặt theo path **giống base** thì override mới có hiệu lực (vd base có `account.logout` → tenant cũng phải `{ "account": { "logout": "..." } }`).
- ✅ Bundle thiếu key tenant-only → fallback raw key → nên đảm bảo có cả `en` và `vi` (kể cả copy tạm).
- ❌ Component dưới `src/tenants/**` muốn được override **chính bản dịch của nó** → phải `useTenantTranslation`, đừng dùng `useTranslation` thuần.

### 7.6 `navMain` + `workspaceRoutes`

- ✅ Nav item nên có `feature: 'custom.X'` tương ứng với route guard — tắt cờ là cả nav lẫn route đều ẩn.
- ✅ Route path nên có prefix riêng (vd `/acme/...`) để không clash với route chung.
- ❌ Đừng đặt `workspaceRoutes` path trùng với route global (`/projects`, `/calendar`…) — router sẽ pick một cái không deterministic.
- ❌ `workspaceRoutes` đọc tại module load → giá trị PHẢI là literal `RouteObject[]`, KHÔNG dùng hook trong file route. Page bên trong dùng `lazy()` để code-split.

### 7.7 Quy trình test

- Chạy section A (default regression) + section B (tenant mới) trong `docs/feature-flags-test-cases.md`.
- **Hard refresh** (clear cache) khi test cold-load — React Query cache có thể che bug flash.
- Mở DevTools console. Không được có `[feature-flags] Redirect loop detected` xuất hiện trong luồng bình thường (chỉ xuất hiện khi config sai).
- Nếu tenant có ns: mở Network tab → confirm bundle `<slug>/locales/<lng>.json` được tải sau auth, và **không** tải khi đăng nhập bằng user không thuộc tenant.
- Chạy `yarn check` (lint + i18n:verify + tsc) trước khi merge.

---

## 8. Loop protection — Tổng quan

Mọi guard mà redirect đến tenant-derived path đều chạy qua `isRedirectLoop`:

| Guard                         | Loại loop tránh                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `FeatureFlagGuardLayout`      | `defaultLanding` nằm trong module đã tắt                                        |
| `TenantLandingRedirect` (`*`) | `defaultLanding` là URL không match route nào                                   |
| `AuthGuardLayout`             | `defaultLanding` là `/sign-in`, `/sign-up` (auth'd user bị đẩy về public route) |
| `RoleGuardLayout` outer       | `defaultLanding` là path của role khác (vd user truy cập admin path)            |
| `RoleGuardLayout` inner       | `defaultLanding` là role-restricted (vd Mentor-only path cho user `User`)       |

`ProjectPermissionGuardLayout` và axios refresh-token handler dùng path cứng → không tự loop được.

> Nếu thấy `[feature-flags] Redirect loop detected` trong console khi đang dev/test → đọc thông báo, fix tenant config theo gợi ý.

---

## 9. Files liên quan (quick map)

| File                                                      | Vai trò                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/lib/feature-flags/types.ts`                          | Định nghĩa kiểu (TenantConfig + nav types + locale loader)                 |
| `src/lib/feature-flags/default.config.ts`                 | Config mặc định (all-on, no tenant data)                                   |
| `src/lib/feature-flags/tenants.config.ts`                 | **Registry — file bạn sửa khi onboard tenant**                             |
| `src/lib/feature-flags/resolve-tenant-config.ts`          | Merge default + override                                                   |
| `src/lib/feature-flags/use-feature-flags.ts`              | Hooks chính (feature checks)                                               |
| `src/lib/feature-flags/use-filtered-nav-items.ts`         | Lọc nav GLOBAL (dùng chung sidebar + top-nav)                              |
| `src/lib/feature-flags/tenant-nav-items.ts`               | Hook `useTenantNavMain` (nav riêng cho tenant)                             |
| `src/lib/feature-flags/redirect-loop.ts`                  | Helper phát hiện loop                                                      |
| `src/lib/feature-flags/index.ts`                          | Re-export                                                                  |
| `src/lib/i18n/i18n.ts`                                    | Init i18next (ns/defaultNS/fallbackNS)                                     |
| `src/lib/i18n/load-tenant-namespace.ts`                   | Dynamic loader cho tenant ns                                               |
| `src/lib/i18n/use-tenant-translation.ts`                  | Hook đọc tenant ns + fallback base                                         |
| `src/lib/axios.ts`                                        | `createApiClient` factory + shared refresh handler                         |
| `src/layouts/feature-flag-guard.layout.tsx`               | `FeatureFlagGuardLayout`, `TenantLandingRedirect`, `TenantConfigLoading`   |
| `src/layouts/auth-guard.layout.tsx`                       | Auth gate + load tenant namespace                                          |
| `src/layouts/role-guard.layout.tsx`                       | Role gate (đã loop-guarded)                                                |
| `src/routes/user.route.tsx`                               | Route tree — pick `workspaceRoutes` từ TENANT_CONFIGS                      |
| `src/routes/public.route.tsx`                             | Public routes (gồm `/` gắn `module.home`)                                  |
| `src/components/sidebar/users/user-workspace-sidebar.tsx` | Sidebar workspace (global ++ tenant)                                       |
| `src/layouts/user-default.layout.tsx`                     | Top-nav header                                                             |
| `src/tenants/<slug>/`                                     | Nhà cho tenant data (config, locales, nav, routes, api, components, pages) |
| `HOW_TO_ADD_A_TENANT.md`                                  | Checklist 2-bước onboarding ở root repo                                    |
| `docs/i18n.md`                                            | Chi tiết kiến trúc i18n base + tenant                                      |
| `docs/feature-flags-test-cases.md`                        | QA test matrix (English)                                                   |
| `i18next.config.js`                                       | Loại `src/tenants/**` khỏi extract / lint                                  |
| `package.json` (`i18n:check`)                             | `--exclude src/tenants` — verify chỉ chạy trên base                        |

---

## 10. FAQ ngắn

**Q: Sao mình chọn registry post-login mà không phải subdomain hay build-time env?**
A: Same codebase + same build pipeline là yêu cầu cứng → loại build-time env. Subdomain phải setup DNS/SSL cho từng tenant + phá axios cookie rewrite ở dev — overkill khi đã có `organizationId` sẵn trong JWT.

**Q: Khách hàng mới có bị ảnh hưởng nếu chưa thêm vào registry?**
A: Không. `organizationId` không match → dùng `DEFAULT_TENANT_CONFIG` = tất cả module flag bật, không tenant ns / nav / route → hành vi như cũ.

**Q: `useFilteredNavItems` vs `useTenantNavMain` khác gì?**
A: `useFilteredNavItems(items)` lọc một mảng items **truyền vào** (global config) theo role + feature — dùng cho menu mà mọi tenant có thể thấy. `useTenantNavMain()` không nhận tham số, đọc `config.navMain` (do tenant tự khai báo) — dùng cho section sidebar chỉ tenant đó mới có. Sidebar workspace nối kết quả: global trước, tenant sau.

**Q: `useTranslation` vs `useTenantTranslation` khác gì?**
A: `useTranslation()` strict-typed với `I18nKey`, đọc namespace base — dùng cho phần app chung. `useTenantTranslation()` widen `t` sang `(key: string) => string`, đọc tenant ns trước rồi fallback base — dùng cho component dưới `src/tenants/**`, hoặc shared component đang rollout cho tenant override.

**Q: `api` (TaskCoper) và `createApiClient` (tenant) chia sẻ refresh-token state thế nào?**
A: Biến `isRefreshing` + `refreshSubscribers` ở module-scope của `src/lib/axios.ts`, không nằm trong factory. Concurrent 401 ở bất kỳ client nào chỉ trigger **một** refresh; client còn lại đợi qua `refreshSubscribers`. Refresh endpoint là của TaskCoper API (`/v1/users/refresh_token`) — tenant không cần endpoint refresh riêng.

**Q: Khi nào cần `useFeature` vs `isFeatureEnabled`?**
A: Trong component / hook → `useFeature`. Ngoài React (axios, zustand action, utility thuần) → `isFeatureEnabled`.

**Q: Custom flag nhưng không thấy tác dụng?**
A: Cờ chỉ bật trạng thái — code phải có `useFeature('custom.X')` hoặc `requires='custom.X'` để đọc. Grep tên cờ trước khi thêm.

**Q: User báo blank page, không loop, console có lỗi `[feature-flags] Redirect loop detected`?**
A: Tenant config sai. Xem thông báo console — nó nói rõ guard nào trip + path nào loop. Sửa `defaultLanding` hoặc `logoUrl` trong tenant config.

**Q: Test xong rồi flag flicker khi đăng nhập?**
A: Đảm bảo `FeatureFlagGuardLayout` đã `if (isGettingMe) return <TenantConfigLoading />`. Cold reload với cache trống để verify.

**Q: Tenant bundle bị tải cho user không thuộc tenant?**
A: Không nên xảy ra. Loader chỉ chạy trong `useEffect` của `AuthGuardLayout` khi `useTenantConfig()` resolve thành config CÓ `i18nNamespace` + `locales`. User của tenant khác / không có tenant → effect no-op. Nếu thấy bundle xuất hiện trong Network tab → kiểm tra dùng `import('./locales/<lng>.json')` không (Vite mới code-split), không phải `import` static.

**Q: `workspaceRoutes` có thể dùng hook không?**
A: Không. Mảng này build tại module-load (`Object.values(TENANT_CONFIGS).flatMap(...)`), trước khi React mount. Page bên trong dùng `lazy()` để code-split là OK; còn metadata route (path, element wrapper) phải là literal.

**Q: Bao giờ chuyển sang backend cầm flag?**
A: Khi có nhu cầu thay đổi flag không cần deploy frontend. Đổi nội dung `resolve-tenant-config.ts` → React Query call, consumer giữ nguyên. Lưu ý: `navMain` và `workspaceRoutes` chứa component — nếu chuyển backend chỉ nên đẩy `modules` + `custom` + `defaultLanding` + `logoUrl` qua API, còn nav/routes/locales vẫn giữ bundled trong frontend (theo slug tenant).
